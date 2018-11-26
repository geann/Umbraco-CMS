/**
@ngdoc directive
@name umbraco.directives.directive:umbRangeSlider
@restrict E
@scope

@description
<b>Added in Umbraco version 8.0</b>
This directive is a wrapper of the noUiSlider library. Use it to render a slider.
For extra details about options and events take a look here: https://refreshless.com/nouislider/

<h3>Markup example</h3>
<pre>
	<div ng-controller="My.Controller as vm">

        <umb-range-slider 
            ng-model="vm.value"
            on-end="vm.slideEnd(values)">
        </umb-range-slider>

	</div>
</pre>

<h3>Controller example</h3>
<pre>
	(function () {
		"use strict";

		function Controller() {

            var vm = this;

            vm.value = [10];

            vm.slideEnd = slideEnd;

            function slideEnd(values) {
            	// handle change
            }

        }

		angular.module("umbraco").controller("My.Controller", Controller);

	})();
</pre>

@param {object} ngModel (<code>binding</code>): Value for the slider.
@param {object} options (<code>binding</code>): Config object for the date picker.
@param {callback} onSetup (<code>callback</code>): onSetup gets triggered when the slider is initialized
@param {callback} onUpdate (<code>callback</code>): onUpdate fires every time the slider values are changed.
@param {callback} onSlide (<code>callback</code>): onSlide gets triggered when the handle is being dragged.
@param {callback} onSet (<code>callback</code>): onSet will trigger every time a slider stops changing.
@param {callback} onChange (<code>callback</code>): onChange fires when a user stops sliding, or when a slider value is changed by 'tap'.
@param {callback} onStart (<code>callback</code>): onStart fires when a handle is clicked (mousedown, or the equivalent touch events).
@param {callback} onEnd (<code>callback</code>): onEnd fires when a handle is released (mouseup etc), or when a slide is canceled due to other reasons.
**/


(function() {
	'use strict';

	var umbRangeSlider = {
        template: '<div class="umb-range-slider"></div>',
		controller: UmbRangeSliderController,
		bindings: {
            ngModel: '<',
            options: '<',
            onSetup: '&?',
            onUpdate: '&?',
            onSlide: '&?',
            onSet: '&?',
            onChange: '&?',
            onStart: '&?',
            onEnd: '&?'
		}
    };
    
	function UmbRangeSliderController($element, $timeout, $scope, assetsService) {
        
        const ctrl = this;
        let sliderInstance = null;

		ctrl.$onInit = function() {

            // load css file for the date picker
            assetsService.loadCss('lib/nouislider/nouislider.min.css', $scope);

            // load the js file for the date picker
            assetsService.loadJs('lib/nouislider/nouislider.min.js', $scope).then(function () {
                // init date picker
                grabElementAndRun();
            });

        };

		function grabElementAndRun() {
			$timeout(function() {
                const element = $element.find('.umb-range-slider')[0];
				setSlider(element);
			}, 0, true);
        }
        
        function setSlider(element) {

            sliderInstance = element;

            const defaultOptions = {
                "start": [0],
                "step": 1,
                "range": {
                    "min": [0],
                    "max": [100]
                }
            };
            const options = ctrl.options ? ctrl.options : defaultOptions;

            // create new slider
            noUiSlider.create(sliderInstance, options);
            
			if (ctrl.onSetup) {
				ctrl.onSetup({
					slider: sliderInstance
				});
            }

            // If has ngModel set the date
			if (ctrl.ngModel) {
                sliderInstance.noUiSlider.set(ctrl.ngModel);
            }

            // destroy the flatpickr instance when the dom element is removed
			angular.element(element).on('$destroy', function() {
                sliderInstance.noUiSlider.off();
            });

            setUpCallbacks();

			// Refresh the scope
			$scope.$applyAsync();
        }
        
        function setUpCallbacks() {
			if(sliderInstance) {

                // bind hook for update
                if(ctrl.onUpdate) {
                    sliderInstance.noUiSlider.on('update', function (values, handle, unencoded, tap, positions) { 
                        $timeout(function() {
                            ctrl.onUpdate({values: values, handle: handle, unencoded: unencoded, tap: tap, positions: positions});
                        });
                    });
                }

                // bind hook for slide
                if(ctrl.onSlide) {
                    sliderInstance.noUiSlider.on('slide', function (values, handle, unencoded, tap, positions) { 
                        $timeout(function() {
                            ctrl.onSlide({values: values, handle: handle, unencoded: unencoded, tap: tap, positions: positions});
                        });
                    });
                }

                // bind hook for set
                if(ctrl.onSet) {
                    sliderInstance.noUiSlider.on('set', function (values, handle, unencoded, tap, positions) { 
                        $timeout(function() {
                            ctrl.onSet({values: values, handle: handle, unencoded: unencoded, tap: tap, positions: positions});
                        });
                    });
                }

                // bind hook for change
                if(ctrl.onChange) {
                    sliderInstance.noUiSlider.on('change', function (values, handle, unencoded, tap, positions) { 
                        $timeout(function() {
                            ctrl.onChange({values: values, handle: handle, unencoded: unencoded, tap: tap, positions: positions});
                        });
                    });
                }

                // bind hook for start
                if(ctrl.onStart) {
                    sliderInstance.noUiSlider.on('start', function (values, handle, unencoded, tap, positions) { 
                        $timeout(function() {
                            ctrl.onStart({values: values, handle: handle, unencoded: unencoded, tap: tap, positions: positions});
                        });
                    });
                }

                // bind hook for end
                if(ctrl.onEnd) {
                    sliderInstance.noUiSlider.on('end', function (values, handle, unencoded, tap, positions) { 
                        $timeout(function() {
                            ctrl.onEnd({values: values, handle: handle, unencoded: unencoded, tap: tap, positions: positions});
                        });
                    });
                }

            }
        }

    }
    
    angular.module('umbraco.directives').component('umbRangeSlider', umbRangeSlider);
    
})();