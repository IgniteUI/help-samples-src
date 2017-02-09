
        var sampleApp = angular.module('sampleApp', ['igniteui-directives']);
        sampleApp.controller('gridController', function ($scope) {
            $scope.data = angular.copy(northwindProducts.results);

            $scope.deleteProduct = function (ix) {
                $scope.data.splice(ix, 1);
            };

            $scope.addProduct = function () {
                $scope.newProduct.ProductID = $scope.data.length + 1;
                var tmp = angular.copy($scope.newProduct);
                $scope.data.push(tmp);
            };

            $scope.newProduct = {
                ProductID: 21,
                ProductName: null,
                QuantityPerUnit: null,
                UnitsInStock: null
            };
        });
    