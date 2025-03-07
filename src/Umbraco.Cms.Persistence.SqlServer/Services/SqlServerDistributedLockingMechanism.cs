using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.DistributedLocking;
using Umbraco.Cms.Core.DistributedLocking.Exceptions;
using Umbraco.Cms.Core.Exceptions;
using Umbraco.Cms.Infrastructure.Persistence;
using Umbraco.Cms.Infrastructure.Scoping;
using Umbraco.Extensions;

namespace Umbraco.Cms.Persistence.SqlServer.Services;

/// <summary>
///     SQL Server implementation of <see cref="IDistributedLockingMechanism" />.
/// </summary>
public class SqlServerDistributedLockingMechanism : IDistributedLockingMechanism
{
    private ConnectionStrings _connectionStrings;
    private GlobalSettings _globalSettings;
    private readonly ILogger<SqlServerDistributedLockingMechanism> _logger;
    private readonly Lazy<IScopeAccessor> _scopeAccessor; // Hooray it's a circular dependency.

    /// <summary>
    ///     Initializes a new instance of the <see cref="SqlServerDistributedLockingMechanism" /> class.
    /// </summary>
    public SqlServerDistributedLockingMechanism(
        ILogger<SqlServerDistributedLockingMechanism> logger,
        Lazy<IScopeAccessor> scopeAccessor,
        IOptionsMonitor<GlobalSettings> globalSettings,
        IOptionsMonitor<ConnectionStrings> connectionStrings)
    {
        _logger = logger;
        _scopeAccessor = scopeAccessor;
        _globalSettings = globalSettings.CurrentValue;
        _connectionStrings = connectionStrings.CurrentValue;
        globalSettings.OnChange(x => _globalSettings = x);
        connectionStrings.OnChange(x => _connectionStrings = x);

    }

    /// <inheritdoc />
    public bool Enabled => _connectionStrings.IsConnectionStringConfigured() &&
                           string.Equals(_connectionStrings.ProviderName,Constants.ProviderName, StringComparison.InvariantCultureIgnoreCase);

    /// <inheritdoc />
    public IDistributedLock ReadLock(int lockId, TimeSpan? obtainLockTimeout = null)
    {
        obtainLockTimeout ??= _globalSettings.DistributedLockingReadLockDefaultTimeout;
        return new SqlServerDistributedLock(this, lockId, DistributedLockType.ReadLock, obtainLockTimeout.Value);
    }

    /// <inheritdoc />
    public IDistributedLock WriteLock(int lockId, TimeSpan? obtainLockTimeout = null)
    {
        obtainLockTimeout ??= _globalSettings.DistributedLockingWriteLockDefaultTimeout;
        return new SqlServerDistributedLock(this, lockId, DistributedLockType.WriteLock, obtainLockTimeout.Value);
    }

    private sealed class SqlServerDistributedLock : IDistributedLock
    {
        private readonly SqlServerDistributedLockingMechanism _parent;
        private readonly TimeSpan _timeout;

        public SqlServerDistributedLock(
            SqlServerDistributedLockingMechanism parent,
            int lockId,
            DistributedLockType lockType,
            TimeSpan timeout)
        {
            _parent = parent;
            _timeout = timeout;
            LockId = lockId;
            LockType = lockType;
            if (_parent._logger.IsEnabled(Microsoft.Extensions.Logging.LogLevel.Debug))
            {
                _parent._logger.LogDebug("Requesting {lockType} for id {id}", LockType, LockId);
            }

            try
            {
                switch (lockType)
                {
                    case DistributedLockType.ReadLock:
                        ObtainReadLock();
                        break;
                    case DistributedLockType.WriteLock:
                        ObtainWriteLock();
                        break;
                    default:
                        throw new ArgumentOutOfRangeException(nameof(lockType), lockType, @"Unsupported lockType");
                }
            }
            catch (SqlException ex) when (ex.Number == 1222)
            {
                if (LockType == DistributedLockType.ReadLock)
                {
                    throw new DistributedReadLockTimeoutException(LockId);
                }

                throw new DistributedWriteLockTimeoutException(LockId);
            }
            if (_parent._logger.IsEnabled(Microsoft.Extensions.Logging.LogLevel.Debug))
            {
                _parent._logger.LogDebug("Acquired {lockType} for id {id}", LockType, LockId);
            }
        }

        public int LockId { get; }

        public DistributedLockType LockType { get; }

        public void Dispose()
        {
            if (_parent._logger.IsEnabled(Microsoft.Extensions.Logging.LogLevel.Debug))
            {
                // Mostly no op, cleaned up by completing transaction in scope.
                _parent._logger.LogDebug("Dropped {lockType} for id {id}", LockType, LockId);
            }
        }

        public override string ToString()
            => $"SqlServerDistributedLock({LockId}, {LockType}";

        private void ObtainReadLock()
        {
            IUmbracoDatabase? db = _parent._scopeAccessor.Value.AmbientScope?.Database;

            if (db is null)
            {
                throw new PanicException("Could not find a database");
            }

            if (!db.InTransaction)
            {
                throw new InvalidOperationException(
                    "SqlServerDistributedLockingMechanism requires a transaction to function.");
            }

            if (db.Transaction.IsolationLevel < IsolationLevel.ReadCommitted)
            {
                throw new InvalidOperationException(
                    "A transaction with minimum ReadCommitted isolation level is required.");
            }

            const string query = "SELECT value FROM umbracoLock WITH (REPEATABLEREAD)  WHERE id=@id";

            var lockTimeoutQuery = $"SET LOCK_TIMEOUT {_timeout.TotalMilliseconds}";

            // execute the lock timeout query and the actual query in a single server roundtrip
            var i = db.ExecuteScalar<int?>($"{lockTimeoutQuery};{query}", new { id = LockId });

            if (i == null)
            {
                // ensure we are actually locking!
                throw new ArgumentException(@$"LockObject with id={LockId} does not exist.", nameof(LockId));
            }
        }

        private void ObtainWriteLock()
        {
            IUmbracoDatabase? db = _parent._scopeAccessor.Value.AmbientScope?.Database;

            if (db is null)
            {
                throw new PanicException("Could not find a database");
            }

            if (!db.InTransaction)
            {
                throw new InvalidOperationException(
                    "SqlServerDistributedLockingMechanism requires a transaction to function.");
            }

            if (db.Transaction.IsolationLevel < IsolationLevel.ReadCommitted)
            {
                throw new InvalidOperationException(
                    "A transaction with minimum ReadCommitted isolation level is required.");
            }

            const string query =
                @"UPDATE umbracoLock WITH (REPEATABLEREAD) SET value = (CASE WHEN (value=1) THEN -1 ELSE 1 END) WHERE id=@id";

            var lockTimeoutQuery = $"SET LOCK_TIMEOUT {_timeout.TotalMilliseconds}";

            // execute the lock timeout query and the actual query in a single server roundtrip
            var i = db.Execute($"{lockTimeoutQuery};{query}", new { id = LockId });

            if (i == 0)
            {
                // ensure we are actually locking!
                throw new ArgumentException($"LockObject with id={LockId} does not exist.");
            }
        }
    }
}
