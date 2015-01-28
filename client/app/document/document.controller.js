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
  .controller('DocumentEditCtrl', function($scope, Auth, Document, $stateParams, $location){
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
      if($scope.document._id === undefined){
        Document.save({
          title: $scope.document.title,
          content: $scope.document.content,
          parent: $scope.document.parent
        }, function(){
          location.href = '/document/' + $scope.document.title;
        });
      }else{
        Document.update({
          title: $scope.document.title,
          content: $scope.document.content,
          parent: $scope.document.parent
        }, function(){
          location.href = '/document/' + $scope.document.title;
        });
      }

    };
  });
