angular.module('angularSchemaFormCountrySelect')
    .directive('countrySelect', ['angularSchemaFormCountrySelectCountries', function (countries) {
        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {},
            template: '' +
            '<select class="form-control" ng-model="modelValue" ng-change="updateModel(modelValue)" ng-options="country as country.name for country in countries track by country.iso">' +
            '    <option value=""></option>' +
            '</select>',
            link: function (scope, element, attrs, ngModel) {
                scope.modelValue = ngModel.$viewValue;

                // https://github.com/umpirsky/country-list
                scope.countries = countries;

                scope.updateModel = function (modelValue) {
                    ngModel.$setViewValue(modelValue ? modelValue.iso : '');
                };
            }
        };
    }])
;
