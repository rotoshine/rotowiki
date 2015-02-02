'use strict';

angular.module('rotowikiApp')
  .controller('DocumentCtrl', function ($scope, Auth, Document, $stateParams, markdownService) {
    $scope.title = $stateParams.title;
    $scope.isNotExistDocument = false;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.document = null;

    $scope.init = function(){
      Document
        .get({title: $scope.title})
        .$promise.then(function(document){
          $scope.document = document;

          window.document.title = 'rotowiki - ' + document.title;

        }, function(err){
          if(err.status === 404){
            $scope.isNotExistDocument = true;
          }
        });
    };

    $scope.createSubDocument = function(){
      alertify.prompt($scope.document.title + '의 하위 문서를 만듭니다. 하위 문서 제목을 입력해주세요.', function(answer, title){
        if(answer){
          Document
            .get({title: title})
            .$promise.then(function(document){
              if(document){
                alertify.alert('해당 제목의 문서가 이미 존재합니다.');
              }
            }, function(){
              location.href = '/document-edit/' + title + '?isNew=true&parent=' + $scope.document._id;
            });
        }
      });
    };
  })
  .controller('DocumentEditCtrl', function($scope, Auth, Document, $stateParams, $location, $modal, markdownService, $upload){
    $scope.uploadImage = null;

    var blurRange = -1;
    $scope.setSelectionRange = function($event){
      blurRange = $event.target.selectionStart;
    };

    var fileUrl = '/api/documents/' + $stateParams.title + '/files';
    $scope.imageUpload = function($files){
      if($files.length === 1){
        $upload.upload({
          file: $files[0],
          url: fileUrl
        }).success(function(imageFile){
          var imgTag = '\r\n![' + $stateParams.title + '의 이미지](' + fileUrl + '/' + imageFile._id + ')\r\n';

          if(blurRange > -1){
            $scope.document.content = $scope.document.content.substring(0, blurRange) +
              imgTag +
              $scope.document.content.substring(blurRange, $scope.document.content.length);
          }else{
            $scope.document.content = $scope.document.content + imgTag;
          }
        }).error(function(){
          alertify.alert('파일 업로드 중 에러가 발생했습니다.');
        });
      }
    };

    $scope.document = {
      title: $stateParams.title,
      content: ''
    };

    var parentDocumentId = $location.search().parent;
    if(parentDocumentId !== undefined){
      $scope.document.parent = parentDocumentId;
    }

    $scope.markdownToHTML = '';

    $scope.$watch('document.content', function(){
      $scope.markdownToHTML = markdownService.toHTML($scope.document.content);
    });


    $scope.init = function(){
      window.document.title = 'rotowiki - ' + $scope.document.title + ' edit';
      if(!$location.search().isNew){
        Document
          .get({title: $scope.document.title})
          .$promise.then(function(document){
            $scope.document = document;
            if($scope.document.content === undefined){
              $scope.document.content = '';
            }
          });
      }
    };

    $scope.save = function(){
      // 임시처리. 원래는 markdown service에서 제거 되서 날라오는 게 맞음..
      // 조치하고 나중에 이 코드 없애자.
      $scope.document.content = $scope.document.content.replace(/<script/gi, '').replace(/<\/script>/, '');
      var saveDocument = {
        title: $scope.document.title,
        content: $scope.document.content
      };

      if($scope.document.parent && $scope.document.parent._id){
        saveDocument.parent = $scope.document.parent._id
      }else{
        saveDocument.parent = $scope.document.parent;
      }
      if($scope.document._id === undefined){
        Document.save(saveDocument, function(){
          location.href = '/document/' + $scope.document.title;
        });
      }else{
        Document.update(saveDocument, function(){
          location.href = '/document/' + $scope.document.title;
        });
      }
    };

    $scope.hasChangeParentDocument = false;
    $scope.parentChangeModal = {
      show: function(){
        var modalInstance = $modal.open({
          templateUrl: 'parentChangeModal.html',
          controller: 'DocumentParentChangeController',
          resolve: {
            currentDocument: function(){
              return $scope.document;
            }
          }
        });

        modalInstance.result.then(function(parentDocument){
          $scope.document.parent = parentDocument;
          $scope.hasChangeParentDocument = true;
        });
      }
    };
  })
  .controller('DocumentParentChangeController', function($scope, $modalInstance, Document, currentDocument){
    $scope.currentDocument = currentDocument;
    if($scope.currentDocument.parent === undefined){
      $scope.currentDocument.parent = {
        title: ''
      };
    }
    $scope.isNowSearching = false;
    $scope.searchParentDocumentTitle = '';
    $scope.searchResults = null;
    $scope.selectedParentDocument = null;
    $scope.parentAndSubSameError = false;

    $scope.select = function(parentDocument){
      if(parentDocument.title === $scope.currentDocument.title){
        $scope.parentAndSubSameError = true;
      }else{
        for(var i = 0; i < $scope.searchResults.length; i++){
          $scope.searchResults[i].selected = false;
        }
        parentDocument.selected = true;
        $scope.selectedParentDocument = parentDocument;
        $scope.parentAndSubSameError = false;
      }
    };

    $scope.change = function(){
      if($scope.selectedParentDocument !== null){
        $modalInstance.close($scope.selectedParentDocument);
      }else{
        alertify.alert('상위문서를 선택해주세요.');
      }
    };

    $scope.hide = function(){
      $modalInstance.dismiss('cancel');
    };


    $scope.searchParentDocument = function(){
      if($scope.searchParentDocumentTitle.length > 1){
        if($scope.searchParentDocumentTitle === $scope.currentDocument.title){
          $scope.parentAndSubSameError = true;
        }else {
          $scope.parentAndSubSameError = false;
          $scope.isNowSearching = true;
          Document
            .query({
              title: $scope.searchParentDocumentTitle
            })
            .$promise.then(function (documents) {
              $scope.isNowSearching = false;
              $scope.searchResults = documents;
            }, function () {
              $scope.isNowSearching = false;
              $scope.searchResults = [];
            });
        }
      }

    }
  })
  .controller('DocumentRandomCtrl', function($state, Document){
    Document
      .random(function(document){
        $state.go('document', { title: document.title });
      })
  })
  .controller('DocumentAllCtrl', function($scope, Document, $timeout){
    $scope.isNowLoading = false;
    $scope.currentPage = 1;
    $scope.pageCount = 5;
    $scope.loadedDocuments = null;
    $scope.currentSortOption = 'updatedAt';
    $scope.hasArriveLastPage = false;

    $scope.loadMoreDocuments = function(){
      if(!$scope.hasArriveLastPage){
        $scope.isNowLoading = true;
        Document
          .query({
            sort: $scope.currentSortOption,
            page: $scope.currentPage,
            pageCount: $scope.pageCount
          })
          .$promise
          .then(function(documents){
            for(var i = 0; i < documents.length; i++){
              var document = documents[i];
              if(document.content.length > 50){
                document.content = document.content.substring(0, 48) + '..';
              }
            }

            $scope.isNowLoading = false;

            $scope.currentPage = $scope.currentPage + 1;

            if(documents.length < $scope.pageCount){
              $scope.hasArriveLastPage = true;
            }

            if($scope.loadedDocuments === null){
              $scope.loadedDocuments = documents;
            }else{
              $scope.loadedDocuments = $scope.loadedDocuments.concat(documents);
            }

            var $container = $('document-container');
            if($container.data('masonry') !== undefined){
              $container.data('masonry').destroy();
            }

            $timeout(function(){
              $container.masonry({
                itemSelector: '.item'
              });

              console.log($container.data('masonry'));
            }, 500);
          });
      }
    };

    $scope.init = function(){
      $scope.loadMoreDocuments();
    };
  });
