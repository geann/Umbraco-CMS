// Copyright (c) Umbraco.
// See LICENSE for more details.

using System.ComponentModel;

namespace Umbraco.Cms.Core.Configuration.Models;

/// <summary>
///     Typed configuration options for NuCache settings.
/// </summary>
[UmbracoOptions(Constants.Configuration.ConfigNuCache)]
public class NuCacheSettings
{
    internal const string StaticNuCacheSerializerType = "MessagePack";
    internal const int StaticSqlPageSize = 1000;
    internal const int StaticKitBatchSize = 1;
    internal const bool StaticUsePagedSqlQuery = true;

    /// <summary>
    ///     Gets or sets a value defining the BTree block size.
    /// </summary>
    [Obsolete("This property is no longer used. Scheduled for removal in v16")]
    public int? BTreeBlockSize { get; set; }

    /// <summary>
    ///     The serializer type that nucache uses to persist documents in the database.
    /// </summary>
    [DefaultValue(StaticNuCacheSerializerType)]
    public NuCacheSerializerType NuCacheSerializerType { get; set; } = Enum.Parse<NuCacheSerializerType>(StaticNuCacheSerializerType);

    /// <summary>
    ///     The paging size to use for nucache SQL queries.
    /// </summary>
    [DefaultValue(StaticSqlPageSize)]
    public int SqlPageSize { get; set; } = StaticSqlPageSize;

    /// <summary>
    ///     The size to use for nucache Kit batches.  Higher value means more content loaded into memory at a time.
    /// </summary>
    [DefaultValue(StaticKitBatchSize)]
    [Obsolete("This property is no longer used")]
    public int KitBatchSize { get; set; } = StaticKitBatchSize;

    [Obsolete("This property is no longer used")]
    public bool UnPublishedContentCompression { get; set; } = false;

    [DefaultValue(StaticUsePagedSqlQuery)]
    public bool UsePagedSqlQuery { get; set; } = true;
}
