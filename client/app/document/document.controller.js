'use strict';

angular.module('rotowikiApp')
  .controller('DocumentCtrl', function ($scope, Auth, Document, $stateParams) {
    $scope.title = $stateParams.title;
    $scope.isNotExistDocument = false;
    $scope.isLoggedIn = Auth.isLoggedIn;

    $scope.markDownContent = '';
    $scope.document = null;

    $scope.init = function(){
      Document
        .get({title: $scope.title})
        .$promise.then(function(document){
          $scope.document = document;
          window.document.title = 'rotowiki - ' + document.title;
          $scope.markDownContent = markdown.toHTML(document.content);
          $scope.document.moment = moment(document.updatedAt).from();
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
  .controller('DocumentEditCtrl', function($scope, Auth, Document, $stateParams, $location, $modal){
    $scope.document = {
      title: $stateParams.title,
      content: ''
    };

    var parentDocumentId = $location.search().parent;
    if(parentDocumentId !== undefined){
      $scope.document.parent = parentDocumentId;
    }

    $scope.markDownContent = '';

    $scope.$watch('document.content', function(){
      $scope.markDownToHTML = markdown.toHTML($scope.document.content);
    });

    $scope.init = function(){
      window.document.title = 'rotowiki - ' + $scope.document.title + ' edit';
      if(!$location.search().isNew){
        Document
          .get({title: $scope.document.title})
          .$promise.then(function(document){
            $scope.document = document;
          });
      }
    };

    $scope.save = function(){
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
  });
