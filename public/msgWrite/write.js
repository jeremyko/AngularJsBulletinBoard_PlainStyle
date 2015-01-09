/**
 * Created by kojunghyun on 14. 12. 31..
 */

var myControllerModule = angular.module('writeModule', ['ngRoute','myServiceModule']);

myControllerModule.controller('writeCtrl', ['$scope', '$location','myGlobalDataService','myHttpService',
    function($scope,$location, myGlobalDataService,myHttpService) {

        //$scope.currentPage = myGlobalDataService.pageInfo.currentPage;
        $scope.formData = {};
        $scope.CreateGuestMsg = function() {
            if ($scope.formData.user != undefined && $scope.formData.title != undefined && $scope.formData.contents != undefined) {
                myHttpService.create($scope.formData)
                    .success(function() {
                        $scope.formData = {}; //reset
                        $location.path( "/list" );

                        myGlobalDataService.pageInfo.currentPageSet=1;//20141214
                        myGlobalDataService.pageInfo.currentPage =1;
                    })
                    .error (function () {
                        console.log('create Error'); //debug
                    });
            }
        };
    }]);