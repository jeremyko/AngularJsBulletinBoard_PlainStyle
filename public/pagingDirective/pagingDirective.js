/**
 * Created by kojunghyun on 14. 12. 31..
 */

'use strict';

var myDirectiveModule = angular.module('myDirectiveModule', ['myServiceModule']);

//-----------------------------------------------------------------------------
myDirectiveModule.controller('myPaginationController', ['$scope', '$location','$attrs', '$parse','$http', 'myHttpService', 'myGlobalDataService',
    function ($scope, $location, $attrs, $parse,  $http, myHttpService, myGlobalDataService) {
        var pageInfo = myGlobalDataService.pageInfo;
        //1 번만 로딩된다. list.js를 통해 이미 1 page 데이터는 가져온 상태이다(최초 기동시 1page).
        //console.log("myPaginationDirective controller maxVisiblePages="+$scope.maxVisiblePages+
        //    " $scope.countAllApiUrl="+$scope.countAllApiUrl ); //debug
        //console.log("$scope.testStr-->",$scope.testStr);//TEST!!

        pageInfo.maxVisiblePages = parseInt( $scope.maxVisiblePages);

        //TEST!!!------------
        /*
        if ($attrs.listPerPage) {
            //isolate scope
            $scope.$parent.$watch($parse($attrs.listPerPage), function(value) {
                console.log("$attrs.listPerPage-->",parseInt(value, 10) );
            });
        } else {
        }
        */

        //pageInfo.listPerPage = $scope.listPerPage;
        //console.log("myPaginationController-->",$scope.listPerPage);//TEST!!

        //----------------------------------
        //페이지별로 서버에 요청할 때 마다 호출 된다. 전체 건수는 별도로 요청해서 알아내야함.
        //최신 데이터 갯수를 바탕으로 페이징을 계산하기 위함.
        //XXX : myGlobalDataService 종속성 !!!
        $scope.getCountAll = function() {
            $http.get($scope.countAllApiUrl )
                .success(function(totalCount) {
                    var i = 0;
                    //console.log( "-myPaginationDirective totalCount: " + totalCount ); //debug
                    pageInfo.totalMsgCnt = totalCount; //save to service
                    pageInfo.totalPages = Math.ceil(pageInfo.totalMsgCnt / pageInfo.listPerPage);
                    pageInfo.totalPageSets = Math.ceil(pageInfo.totalPages / pageInfo.maxVisiblePages);

                    $scope.totalPages = pageInfo.totalPages ;
                    $scope.currentPage = pageInfo.currentPage;
                    $scope.totalPages = pageInfo.totalPages ;

                    if(pageInfo.currentPageSet<0){
                        //최초 상태 : pageInfo.currentPage 를 이용해서 currentPageSet 를 계산.
                        //사용자가 페이지 버튼을 조작하면 음수 아닌 값이 설정될것이다.
                        console.log( "----- currentPageSet is not set! " ); //debug

                        for ( i = 1; i <= pageInfo.totalPageSets; i++) {
                            var endPageInVisiblePages = pageInfo.maxVisiblePages * i;
                            //console.log( "----- endPageInVisiblePages :"+endPageInVisiblePages ); //debug
                            if( pageInfo.currentPage <= endPageInVisiblePages) {
                                pageInfo.currentPageSet = i;
                                console.log( "----- set currentPageSet :"+i ); //debug
                                break;
                            }
                        }
                    }

                    $scope.disabledNext = 0;
                    $scope.disabledLast = 0;

                    /*
                    if(pageInfo.currentPageSet == 1 ) {
                        $scope.disabledFirst = 1;
                        $scope.disabledPrevious = 1;
                    }

                    if(pageInfo.currentPageSet > 1 ) {
                        $scope.disabledFirst = 0;
                        $scope.disabledPrevious = 0;
                    }
                     if(pageInfo.currentPageSet == pageInfo.totalPageSets ) {
                     $scope.disabledNext = 1;
                     $scope.disabledLast = 1;
                     }
                    */
                    if(pageInfo.currentPage == 1 ) {
                        $scope.disabledFirst = 1;
                        $scope.disabledPrevious = 1;
                    }

                    if(pageInfo.currentPage > 1 ) {
                        $scope.disabledFirst = 0;
                        $scope.disabledPrevious = 0;
                    }

                    if(pageInfo.currentPage == pageInfo.totalPages ) {
                        $scope.disabledNext = 1;
                        $scope.disabledLast = 1;
                    }

                    $scope.pageSetArray=[];
                    $scope.activeIndexAry=[];

                    for (i = 0; i < pageInfo.maxVisiblePages; i++) {
                        var pageIndex = (pageInfo.maxVisiblePages*(pageInfo.currentPageSet-1)) + (i + 1);

                        if(pageIndex <= pageInfo.totalPages ) {
                            $scope.pageSetArray.push(pageIndex);
                            if(pageInfo.currentPage ==pageIndex){
                                $scope.activeIndexAry.push(1); //set active page
                            }else{
                                $scope.activeIndexAry.push(0);
                            }
                        }
                    }


                    //--------------------------------------------------------------------
                    //각 페이지에 표시될 게시물 순번을 생성한다.
                    var nIndexStart = ((myGlobalDataService.pageInfo.currentPage-1) * myGlobalDataService.pageInfo.listPerPage)+1 ;
                    //console.log( "nIndexStart ="+nIndexStart ); //debug
                    var listIndexAry=[];
                    for (i = 0; i < myGlobalDataService.pageInfo.listPerPage; i++) {
                        listIndexAry.push ( nIndexStart+i );
                        //console.log( "push :"+(nIndexStart+i) ); //debug
                    }
                    angular.copy(listIndexAry, myGlobalDataService.pageInfo.listIndexAry);
                })
                .error (function () {
                    console.log( "count all Error!: "  );
                });
        };

        //----------------------------------
        $scope.getCountAll();


        //--------------------------------------------------------------
        $scope.moveToFirstPage = function(){
            pageInfo.currentPageSet = 1;
            pageInfo.currentPage=1;
            $scope.pageChanged(pageInfo.currentPage);
        };

        //--------------------------------------------------------------
        $scope.moveToPreviousPageSet = function() {

            if(pageInfo.currentPageSet == 1 ) {
                //console.log( "showPreviousPageSet --> SKIP!!");//debug
                return; //skip
            }
            pageInfo.currentPageSet -= 1;

            var activatePageIndex = (pageInfo.maxVisiblePages*(pageInfo.currentPageSet-1)) + pageInfo.maxVisiblePages;
            //console.log( "showPreviousPageSet --> activatePageIndex:"+activatePageIndex+" pageInfo.maxVisiblePages:"+pageInfo.maxVisiblePages);//debug
            pageInfo.currentPage=activatePageIndex;
        };
        //--------------------------------------------------------------
        $scope.moveToNextPageSet = function(){

            if(pageInfo.currentPageSet == pageInfo.totalPageSets ) {
                //console.log( "showNextPageSet --> SKIP!!:"+pageInfo.currentPageSet);//debug
                return; //skip
            }
            pageInfo.currentPageSet += 1;

            //다음 페이지셋의 첫번쩨 페이지로 이동 (ex: 1,2,3,4 페이지셋 표시중 다음을 누른 경우 5번째 패이지 표시)
            var nextFirstPageIndex=(pageInfo.maxVisiblePages*(pageInfo.currentPageSet-1)) + 1;
            pageInfo.currentPage=nextFirstPageIndex;
            $scope.pageChanged(pageInfo.currentPage);
        };

        //--------------------------------------------------------------
        $scope.moveToPreviousPage = function(){

            if(pageInfo.currentPage == 1 ) {
                return; //skip
            }
            pageInfo.currentPage -= 1;

            //check pageSet
            //pageInfo.currentPageSet 에서 -1 변경된 페이지의 인덱스가 0보다 작으면 pageSet을 감소 시킨다.
            var checkPage = pageInfo.currentPage % pageInfo.maxVisiblePages ;
            if(checkPage==0){
                if(pageInfo.currentPageSet == 1 ) {
                    return; //skip
                }
                pageInfo.currentPageSet -= 1;
                //console.log("decrease pageSet:",pageInfo.currentPageSet );
            }
            $scope.pageChanged(pageInfo.currentPage);
        };

        //--------------------------------------------------------------
        $scope.moveToNextPage = function(){

            if(pageInfo.currentPage == pageInfo.totalPages ) {
                //console.log( "showNextPageSet --> SKIP!!:"+pageInfo.currentPageSet);//debug
                return; //skip
            }
            pageInfo.currentPage += 1;

            //check pageSet
            //pageInfo.currentPageSet 에서 +1 변경된 페이지의 인덱스가 현재 페이지set을 넘어가면 pageSet을 +1 시킨다.
            var checkPageSet = pageInfo.currentPageSet * pageInfo.maxVisiblePages ;
            if( pageInfo.currentPage > checkPageSet ){
                if(pageInfo.currentPageSet == pageInfo.totalPageSets ) {
                    return; //skipgit status
                }
                pageInfo.currentPageSet += 1;
            }

            $scope.pageChanged(pageInfo.currentPage);
        };

        //--------------------------------------------------------------
        $scope.moveToLastPage = function(){
            pageInfo.currentPageSet = pageInfo.totalPageSets;
            pageInfo.currentPage=pageInfo.totalPages;
            $scope.pageChanged(pageInfo.currentPage);
        };

        //--------------------------------------------------------------
        $scope.pageChanged = function(page) {
            //console.log("directive: page changed!!!! ->", page); //debug
            pageInfo.currentPage = page;

            $scope.getCountAll();
            myHttpService.getPagedList(page, pageInfo.listPerPage);
        };
}]);


//directive : for pagination : 페이지별로 서버에 요청
myDirectiveModule.directive('myPaginationDirective', function() {

    return {
        restrict: 'E',
        templateUrl: 'pagingDirective/pagination_template.html',


        scope: {
            maxVisiblePages: '@',
            countAllApiUrl:'@'
            //listPerPage:'@'
        },

        //scope:false,

        controller: 'myPaginationController'


    };
});
