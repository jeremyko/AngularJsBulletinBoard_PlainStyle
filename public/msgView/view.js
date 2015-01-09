/**
 * Created by kojunghyun on 14. 12. 31..
 */
var myControllerModule = angular.module('viewModule', ['ngRoute','myServiceModule']);

myControllerModule.controller('viewCtrl', ['$scope', '$routeParams','$location','myGlobalDataService','myHttpService',
    function($scope, $routeParams,$location, myGlobalDataService, myHttpService) {

        var thisIsLastPageAndMsgCnt=0;
        if(myGlobalDataService.pageInfo.currentPage == myGlobalDataService.pageInfo.totalPages ){
            //console.log('myGlobalDataService.pageInfo.totalMsgCnt=',myGlobalDataService.pageInfo.totalMsgCnt); //debug
            //console.log('myGlobalDataService.pageInfo.listPerPage=',myGlobalDataService.pageInfo.listPerPage); //debug
            //마지막 페이지의 메시지갯수가 1개였을때 이메시지를 삭제하는 경우, 이전 페이지로 전환이 필요함!!
            thisIsLastPageAndMsgCnt = myGlobalDataService.pageInfo.totalMsgCnt % myGlobalDataService.pageInfo.listPerPage;
            if(thisIsLastPageAndMsgCnt==0){
                thisIsLastPageAndMsgCnt = myGlobalDataService.pageInfo.listPerPage;
            }
            //console.log('thisIsLastPageAndMsgCnt=',thisIsLastPageAndMsgCnt); //debug
        }

        //$scope.currentPage = myGlobalDataService.pageInfo.currentPage;

        myHttpService.view($routeParams.msgObjId)
            .success(function(data) {
                $scope.msgObjId = $routeParams.msgObjId;
                $scope.userMsg = data;

                myGlobalDataService.already_fetched_data=data; //for editing
            });

        //delete
        $scope.deleteMsg = function (){
            myHttpService.delete($routeParams.msgObjId)
                .success(function() {
                    //마지막 페이지의 마지막 게시물 삭제시, last 페이지 변경(-1)
                    if(thisIsLastPageAndMsgCnt ==1){
                        //console.log('decrease page !!'); //debug
                        myGlobalDataService.pageInfo.currentPage -=1;
                    }

                    $location.path( "/list" );
                })
                .error (function () {
                console.log('deleteMsg Error'); //debug
                $location.path( "/list" );
            });
        };

        //edit
        $scope.editMsg = function (){
            $location.path( "/edit/"+ $routeParams.msgObjId );
        };
    }]);