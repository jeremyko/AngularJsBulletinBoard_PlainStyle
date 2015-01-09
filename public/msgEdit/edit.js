/**
 * Created by kojunghyun on 14. 12. 31..
 */

var myControllerModule = angular.module('editModule', ['ngRoute','myServiceModule']);

myControllerModule.controller('editCtrl', ['$scope','$location','myGlobalDataService','myHttpService',
    function($scope,$location,myGlobalDataService,myHttpService) {
        //$scope.currentPage = myGlobalDataService.pageInfo.currentPage;
        $scope.formData = myGlobalDataService.already_fetched_data;

        $scope.UpdateGuestMsg = function() {
            if ($scope.formData.contents.length > 0) {
                //console.log("contents valid"); //debug
                myHttpService.update($scope.formData)
                    .success(function() {
                        $scope.formData = {}; //reset
                        $location.path( "/list" );

                    })
                    .error (function () {
                    console.log('update Error'); //debug
                });
            }else{
                console.log("contents invalid!!");
                //TODO
            }
        };
    }]);

