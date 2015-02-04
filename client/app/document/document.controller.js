'use strict';

angular.module('rotowikiApp')
  .controller('DocumentCtrl', function ($scope, $rootScope, Auth, Document, $state, $stateParams) {
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
      $rootScope.keydownListeners.stopAll();
      alertify.prompt($scope.document.title + '의 하위 문서를 만듭니다. 하위 문서 제목을 입력해주세요.', function(answer, title){
        if(answer){
          Document
            .get({title: title})
            .$promise.then(function(document){
              if(document){
                alertify.alert('해당 제목의 문서가 이미 존재합니다.');
              }
            }, function(){
              Document
                .save({
                  title: title,
                  parent: $scope.document._id
                }, function(){
                  $state.go('document edit', {title: title});
                });
            });
        }
      });
    };
  })
  .controller('DocumentEditCtrl', function($scope, Auth, Document, $state, $stateParams, $location, $modal, markdownService, $upload, $rootScope) {
    function simpleTemplate(text, data){
      for(var key in data){
        var regExp = new RegExp('{' + key + '}', 'g');
        text = text.replace(regExp, data[key]);
      }
      return text;
    }

    var CARRIAGE_RETURN_CHAR = '\r\n';
    $scope.status = {
      linkButtonsOpen: false
    };

    $scope.uploadImage = null;

    var blurRange = -1;
    $scope.setSelectionRange = function ($event) {
      blurRange = $event.target.selectionStart;
    };

    var fileUrl = '/api/documents/' + $stateParams.title + '/files';
    $scope.imageUpload = function ($files) {
      if ($files.length === 1) {
        $upload.upload({
          file: $files[0],
          url: fileUrl
        }).success(function (imageFile) {
          var imgTag = CARRIAGE_RETURN_CHAR + simpleTemplate('![{title}의 이미지]({imageUrl})', {
              title: $stateParams.title,
              imageUrl: fileUrl + '/' + imageFile._id
            }) + CARRIAGE_RETURN_CHAR;

          if (blurRange > -1) {
            $scope.document.content = $scope.document.content.substring(0, blurRange) +
            imgTag +
            $scope.document.content.substring(blurRange, $scope.document.content.length);
          } else {
            $scope.document.content = $scope.document.content + imgTag;
          }
        }).error(function () {
          alertify.alert('파일 업로드 중 에러가 발생했습니다.');
        });
      }
    };

    $scope.document = {
      title: $stateParams.title,
      content: ''
    };

    var parentDocumentId = $location.search().parent;
    if (parentDocumentId !== undefined) {
      $scope.document.parent = parentDocumentId;
    }

    $scope.markdownToHTML = '';

    $scope.markdownRender = function(){
      $scope.markdownToHTML = markdownService.toHTML($scope.document.content);
    };


    $scope.init = function () {
      window.document.title = 'rotowiki - ' + $scope.document.title + ' edit';
      Document
        .get({title: $scope.document.title})
        .$promise.then(function (document) {
          $scope.document = document;
          $scope.changedDocumentTitle = document.title;
          if ($scope.document.content === undefined) {
            $scope.document.content = '';
          }
        });
    };

    $scope.isNowSaving = false;
    $scope.save = function () {
      $scope.isNowSaving = true;

      // TODO 임시처리. 원래는 markdown service에서 제거 되서 날라오는 게 맞음..조치하고 나중에 이 코드 없애자.
      $scope.document.content = $scope.document.content.replace(/<script/gi, '').replace(/<\/script>/, '');

      var saveDocument = {
        title: $scope.document.title,
        content: $scope.document.content
      };

      if ($scope.changedDocumentTitle !== $scope.document.title){
        saveDocument.changedDocumentTitle = $scope.changedDocumentTitle;
      }

      if ($scope.document.parent && $scope.document.parent._id) {
        saveDocument.parent = $scope.document.parent._id
      } else {
        saveDocument.parent = $scope.document.parent;
      }
      Document
        .update(saveDocument)
        .$promise
        .then(function (updatedDocument) {
          $scope.isNowSaving = false;
          $state.go('document', {title: updatedDocument.title});
        }, function (err) {
          $scope.isNowSaving = false;
          alertify.alert(err.message);
        });
    };

    $scope.keydownListeners = $rootScope.keydownListeners;

    $scope.hasChangeParentDocument = false;
    $scope.parentChangeModal = {
      show: function () {
        $scope.keydownListeners.stopAll();

        var modalInstance = $modal.open({
          templateUrl: 'parentChangeModal.html',
          controller: 'DocumentParentChangeCtrl',
          resolve: {
            currentDocument: function () {
              return $scope.document;
            }
          }
        });

        modalInstance.result.then(function (parentDocument) {
          $scope.document.parent = parentDocument;
          $scope.hasChangeParentDocument = true;
          $scope.keydownListeners.listen('documentEdit');
        });
      }
    };

    $scope.linkTypes = {
      DOCUMENT: {
        name: 'document',
        text: '문서',
        iconClass: 'fa-file',
        linkObject: {
          searchKeyword: '',
          document: null
        },
        linkGenerator: function () {
          if(this.linkObject.document !== null){
            return simpleTemplate('[{title}](/document/{title})', { title: this.linkObject.document.title });
          }
        }
      },
      EXTERNAL_LINK: {
        name: 'externalLink',
        text: '외부 링크',
        iconClass: 'fa-external-link',
        linkObject: null,
        linkGenerator: function(){
          if(this.linkObject !== null && this.linkObject.linkName && this.linkObject.linkUrl){
            return simpleTemplate('<a href="{linkUrl}" target="_blank">{linkName}<i class="fa fa-external-link"></i></a>', this.linkObject);
          }
        }
      },
      YOUTUBE: {
        name: 'youtube',
        text: 'youtube',
        iconClass: 'fa-youtube',
        linkObject: null,
        linkGenerator: function(){
          if(this.linkObject !== null){
            var youtubeUrl = this.linkObject;

            // 주소 형식 변환
            if(youtubeUrl.indexOf('/watch?v=') > -1){
              youtubeUrl = youtubeUrl.replace('/watch?v=', '/embed/');
            }else if(youtubeUrl.indexOf('youtu.be') > -1){
              youtubeUrl = youtubeUrl.replace('youtu.be', 'youtube.com/embed')
            }
            return simpleTemplate(CARRIAGE_RETURN_CHAR + '<iframe src="{youtubeUrl}" allowfullscreen></iframe>' + CARRIAGE_RETURN_CHAR, {
              youtubeUrl: youtubeUrl
            });
          }
        }
      },
      SOUNDCLOUD: {
        name: 'soundcloud',
        text: 'soundcloud',
        iconClass: 'fa-soundcloud',
        linkObject: null,
        linkGenerator: function(){
          if(this.linkObject !== null){
            var soundcloudUrl = this.linkObject;
            var soundcloudData = null;

            // 동기처리로 해서 가져옴
            $.ajax({
              url: 'http://soundcloud.com/oembed?format=json&url=' + soundcloudUrl,
              async: false,
              success: function(data){
                soundcloudData = data;
              }
            });

            if(soundcloudData !== null && soundcloudData.html){
              return CARRIAGE_RETURN_CHAR + soundcloudData.html + CARRIAGE_RETURN_CHAR;
            }
          }
        }
      }
    };

    $scope.linkInsertModal = {
      show: function(selectedTab){
        $scope.keydownListeners.stopAll();

        var modalInstance = $modal.open({
          templateUrl: 'linkInsertModal.html',
          controller: 'LinkInsertModalCtrl',
          resolve: {
            selectedTab: function(){
              return selectedTab;
            },
            linkTypes: function(){
              return $scope.linkTypes;
            }
          }
        });

        modalInstance.result.then(function(linkHTML){
          $scope.keydownListeners.listen('documentEdit');
          var content = $scope.document.content;
          if(blurRange > -1){
            content = content.substring(0, blurRange)
              + linkHTML
              + content.substring(blurRange, content.length);
            $scope.document.content = content;
          }else{
            $scope.document.content = content + linkHTML;
          }
          $('#content').focus();
        });
      }
    };
  })
  .controller('DocumentParentChangeCtrl', function($scope, $modalInstance, Document, currentDocument){
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
    };
  })
  .controller('LinkInsertModalCtrl', function($scope, selectedTab, linkTypes, $modalInstance, Document, $timeout){
    $scope.selectedTab = selectedTab;

    $scope.selectTab = function(tabName){
      $scope.selectedTab = tabName;
    };

    // tab directive의 active에서 오류나서 이렇게 임시처리 함
    $timeout(function(){
      $('#link-tabs .tab-' + $scope.selectedTab + ' a').click();
      console.log('#link-tabs .tab-' + $scope.selectedTab + ' a');
      console.log($('#link-tabs .tab-' + $scope.selectedTab + ' a'));
    });

    $scope.linkTypes = linkTypes;

    $scope.isNowSearching = false;
    $scope.searchResults = null;

    $scope.searchDocument = function(){
      var documentTab = $scope.linkTypes.DOCUMENT;
      if($scope.selectedTab === documentTab.name && documentTab.linkObject.searchKeyword.length > 1){
        $scope.isNowSearching = true;

        Document
          .query({
            title: documentTab.linkObject.searchKeyword
          })
          .$promise.then(function(documents){
            $scope.isNowSearching = false;
            $scope.searchResults = documents;
          }, function(){
            $scope.isNowSearching = false;
            $scope.searchResults = [];
          })
      }
    };

    function getCurrentTab(){
      for(var key in $scope.linkTypes){
        if($scope.linkTypes.hasOwnProperty(key)){
          if($scope.linkTypes[key].name === $scope.selectedTab) {
            return $scope.linkTypes[key];
          }
        }
      }
      return undefined;
    }
    $scope.selectDocument = function(document){
      var currentTab = getCurrentTab();
      if(currentTab.name === 'document'){
        for(var i = 0; i < $scope.searchResults.length;i++){
          $scope.searchResults[i].selected = false;
        }
        document.selected = true;
        currentTab.linkObject.document = document;
      }
    };

    $scope.applyLink = function(){
      var currentTab = getCurrentTab();
      if(currentTab !== null && currentTab.linkObject !== null){
        $modalInstance.close(currentTab.linkGenerator());
      }
    };

    $scope.hide = function(){
      for(var key in $scope.linkTypes){
        $scope.linkTypes[key].linkObject = null;
      }
      $modalInstance.dismiss('cancel');
    };
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
    $scope.pageCount = 20;
    $scope.loadedDocuments = null;
    $scope.currentSortOption = 'updatedAt';
    $scope.hasArriveLastPage = false;

    var masonry = null;
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


            $timeout(function(){
              if(masonry !== null){
                masonry.destroy();
              }
              masonry = new window.Masonry($('#document-container').get(0), {
                itemSelector: '.item'
              });
            });
          });
      }
    };

    $scope.init = function(){
      $scope.loadMoreDocuments();
    };
  });
