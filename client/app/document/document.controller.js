'use strict';

angular.module('rotowikiApp')
  .controller('DocumentCtrl', function ($scope, $rootScope, Auth, Document, $state, $stateParams, WIKI_NAME) {
    var _ = window._;

    $scope.title = $stateParams.title;

    if($scope.title === undefined || $scope.title === ''){
      alertify.alert('잘못된 문서 접근입니다.');
      $state.go('main');
    }

    $scope.notifyNeedLogin = function(){
      alertify.alert('로그인 후 이 문서를 추천할 수 있습니다.');
    };

    $scope.isNotExistDocument = false;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.document = null;

    $scope.isNowLoading = false;
    $scope.init = function(){
      $scope.isNowLoading = true;
      Document
        .get({title: $scope.title})
        .$promise.then(function(document){
          document.alreadyLike = _.contains(document.likeUsers, Auth.getCurrentUser()._id);

          $scope.document = document;

          window.document.title = WIKI_NAME + ' - ' + document.title;
          setTimeout(function(){
            window.Prism.highlightAll();
          });
          $scope.isNowLoading = false;
        }, function(err){
          if(err.status === 404){
            $scope.isNotExistDocument = true;
          }
          $scope.isNowLoading = false;
        });
    };

    $scope.nowProgressLikeAction = false;

    $scope.like = function(){
      if(!$scope.nowProgressLikeAction){
        $scope.nowProgressLikeAction = true;

        Document
          .like({title: $scope.document.title})
          .$promise.then(function(result){
            $scope.nowProgressLikeAction = false;
            $scope.document.alreadyLike = true;
            $scope.document.likeCount = result.likeCount;
          }, function(){
            $scope.nowProgressLikeAction = false;
          });
      }
    };

    $scope.unlike = function(){
      if(!$scope.nowProgressLikeAction){
        $scope.nowProgressLikeAction = true;

        Document
          .unlike({title: $scope.document.title})
          .$promise.then(function(result){
            $scope.nowProgressLikeAction = false;
            $scope.document.alreadyLike = false;
            $scope.document.likeCount = result.likeCount;
          }, function(){
            $scope.nowProgressLikeAction = false;
          });
      }
    };

    $scope.shareTwitter = function(){
      var INTENT_URL = 'https://twitter.com/intent/tweet';
      var currentUser = Auth.getCurrentUser();
      var documentURL = encodeURIComponent(window.location.protocol + '//' + window.location.host + '/document-by-id/' + $scope.document._id);
      var intentMessage = $scope.document.title + ' 문서를 공유합니다. ';

      if(currentUser && currentUser.name){
        intentMessage = currentUser.name + ' 님이 ' + intentMessage;
      }

      var querystring = 'text=' + intentMessage +
        '&url=' + documentURL +
        '&hashtags=rotowiki,로토위키';

      window.open(INTENT_URL + '?' + querystring);
    };

    $scope.createDocument = function(){
      Document
        .save({
          title: $scope.title
        }, function(savedDocument){
          $state.go('document edit', {title: savedDocument.title});
        });
    };

    // 하위 문서를 만든다.
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
  .controller('DocumentEditCtrl', function($scope, Auth, Document, $state, $stateParams, $location, $modal, markdownService, $upload, $rootScope, WIKI_NAME, $timeout) {

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

    $scope.documentQuickEditHandler = function(type){
      if($scope.editor !== null){
        var range = $scope.editor.getSelectionRange();
        var selectionText = $scope.editor.getSelectedText();

        if(documentUtils[type] !== undefined && selectionText !== ''){
          documentUtils[type](range, selectionText);
        }
      }
    };

    // TODO 나중에 모듈로 빼자.
    // TODO 텍스트 앞뒤로 이미 추가된 텍스트인지 확인하는 옵션 추가할 것.(토글링 되게)
    // TODO 정규표현식으로 간단하게 처리할 수 있을 거 같기도 함.
    var documentUtils = {
      bold: function(range, selectionText){
        $scope.editor.getSession().replace(range, '**' + selectionText + '**');
      },
      italic: function(range, selectionText){
        $scope.editor.getSession().replace(range, '_' + selectionText + '_');
      },
      strike: function(range, selectionText){
        $scope.editor.getSession().replace(range, '-[' + selectionText + ']');
      }
    };

    var fileUrl = '/api/documents/' + $stateParams.title + '/files';
    $scope.imageUpload = function ($files) {
      if ($files.length === 1) {
        $upload.upload({
          file: $files[0],
          url: fileUrl
        }).success(function (imageFile) {
          var imgTag = simpleTemplate('![{title}의 이미지]({imageUrl})', {
              title: $stateParams.title,
              imageUrl: fileUrl + '/' + imageFile._id
            }) + CARRIAGE_RETURN_CHAR;

          if ($scope.currentCursor !== null) {
            imgTag = CARRIAGE_RETURN_CHAR + imgTag;
          }

          $scope.appendHTML(imgTag);
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

    $scope.editor = null;
    $scope.markdownToHTML = '';

    $scope.markdownRender = function(){
      $scope.markdownToHTML = markdownService.toHTML($scope.editor.getValue());

      // prism.js apply
      setTimeout(function(){
        window.Prism.highlightAll();
      });
    };



    $scope.editingBeforeContent = null;
    $scope.currentCursor = null;

    $scope.init = function () {
      window.document.title = WIKI_NAME + ' - ' + $scope.document.title + ' 편집';
      Document
        .get({title: $scope.document.title})
        .$promise.then(function (document) {
          $scope.document = document;

          $scope.changedDocumentTitle = document.title;
          if ($scope.document.content === undefined) {
            $scope.document.content = '';
          }

          $scope.editingBeforeContent = $scope.document.content;

          // wide 환경인 경우에만 적용
          if($('#ace-editor').css('display') !== 'none'){
            $timeout(function(){
              var ace = window.ace;

              $('#ace-editor').width($('.document-edit-wrapper').width());
              var editor = ace.edit('ace-editor');
              editor.on('blur', function (event, editor) {
                $scope.currentCursor = editor.selection.getCursor();
              });
              editor.on('change', function(){
                $scope.isChanged = true;
              });
              var MarkdownMode = ace.require('ace/mode/markdown').Mode;

              editor.getSession().setMode(new MarkdownMode());
              editor.focus();
              $scope.editor = editor;
            });
          }
        });
    };

    $scope.isNowSaving = false;
    $scope.save = function () {
      $scope.isNowSaving = true;

      var saveDocument = {
        title: $scope.document.title
      };

      if($scope.editor == null){
        saveDocument.content = $scope.document.content;
      }else{
        saveDocument.content = $scope.editor.getSession().getValue();
      }

      if ($scope.changedDocumentTitle !== $scope.document.title){
        saveDocument.changedDocumentTitle = $scope.changedDocumentTitle;
      }

      if ($scope.document.parent && $scope.document.parent._id) {
        saveDocument.parent = $scope.document.parent._id;
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
              youtubeUrl = youtubeUrl.replace('youtu.be', 'youtube.com/embed');
            }
            return simpleTemplate(
              CARRIAGE_RETURN_CHAR +
              '<div class="embed-responsive embed-responsive-16by9">' +
                '<iframe class="embed-responsive-item" src="{youtubeUrl}" allowfullscreen></iframe>' +
              '</div>' +
              CARRIAGE_RETURN_CHAR, {
                youtubeUrl: youtubeUrl
              }
            );
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
      },
      SOURCECODE: {
        name: 'sourcecode',
        text:'소스코드',
        iconClass: 'fa-code',
        linkObject: null,
        codes: [
          'javascript',
          'markup',
          'css',
          'sass',
          'handlebars',
          'go',
          'java',
          'c',
          'python',
          'matlab',
          'php',
          'scala',
          'swift',
          'dart',
          'object-c'
        ],
        linkGenerator: function(){
          var code = this.linkObject.code;

          // escape 처리
          code = code
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

          code = '<pre><code class="language-' + this.linkObject.codeType + '">' + code + '</code></pre>\r\n\r\n';
          return code;
        }
      }
    };

    $scope.appendHTML = function(html){
      var editor = $scope.editor;

      if ($scope.currentCursor !== null) {
        editor.selection.moveCursorBy($scope.currentCursor.row, $scope.currentCursor.column);
      } else {
        editor.selection.moveCursorLineEnd();
      }

      editor.insert(html);
    };

    $scope.linkInsertModal = {
      show: function(selectedTab){
        $scope.keydownListeners.stopAll();

        var modalInstance = $modal.open({
          templateUrl: 'linkInsertModal.html',
          controller: 'DocumentEditHelperModalCtrl',
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

          $scope.appendHTML(linkHTML);

          $scope.editor.focus();
        });
      }
    };

    $scope.$on('$locationChangeStart', function(event, newUrl){
      if($scope.editor !== null && $scope.editor.getSession().getValue() !== $scope.editingBeforeContent){
        event.preventDefault();
        alertify.confirm('변경된 내용이 저장되지 않았습니다. 편집 모드를 종료하시겠습니까?', function(ok){
          if(ok){
            // FIXME 이 방식으로 하면 화면전체를 새로고침한다. $location.path가 안 먹는데 대안을 찾아보자.
            location.href = newUrl;
          }
        });
      }
    });
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
  .controller('DocumentEditHelperModalCtrl', function($scope, selectedTab, linkTypes, $modalInstance, Document, $timeout){
    $scope.selectedTab = selectedTab;

    $scope.selectTab = function(tabName){
      $scope.selectedTab = tabName;
    };

    // FIXME tab directive의 active에서 오류나서 이렇게 임시처리 함
    $timeout(function(){
      $('#link-tabs .tab-' + selectedTab).parents('a').click();
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
          });
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
        for(var key in $scope.linkTypes){
          $scope.linkTypes[key].linkObject = null;
        }
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
      });
  })
  .controller('DocumentAllCtrl', function($scope, Document, $timeout, WIKI_NAME){
    window.document.title = WIKI_NAME + ' - 전체보기';

    $scope.sortOptions = [
      {
        text: '수정된 날짜',
        value: 'updatedAt'
      },
      {
        text: '제목',
        value: 'title'
      }
    ];

    $scope.orderOptions = [
      {
        text: '내림차순',
        value: '-1'
      },
      {
        text: '오름차순',
        value: '1'
      }
    ];

    $scope.selectedSortOption = $scope.sortOptions[0];
    $scope.selectedOrderOption = $scope.orderOptions[0];

    $scope.isNowLoading = false;
    $scope.currentPage = 1;
    $scope.pageCount = 20;
    $scope.loadedDocuments = null;
    $scope.hasArriveLastPage = false;

    var masonry = null;

    $scope.loadFirstDocuments = function(){
      masonry = null;
      $scope.currentPage = 1;
      $scope.loadedDocuments = null;
      $scope.loadMoreDocuments();
    };

    $scope.loadMoreDocuments = function(){
      if(!$scope.hasArriveLastPage){
        $scope.isNowLoading = true;
        Document
          .query({
            sort: $scope.selectedSortOption.value,
            asc: $scope.selectedOrderOption.value,
            page: $scope.currentPage,
            pageCount: $scope.pageCount
          })
          .$promise
          .then(function(documents){
            for(var i = 0; i < documents.length; i++){
              var document = documents[i];
              if(document.content && document.content.length > 50){
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


            // masonry가 다시 생성되면서 스크롤이 초기화 되기 떄문에, 이전의 스크롤 값을 가지고 있다가
            // 스크롤을 조정해주는 부분이 필요함.
            var NOT_INIT_ITEM_CLASS = 'not-init-item';
            $timeout(function(){
              var $masonryAddTargetItems = $('.' + NOT_INIT_ITEM_CLASS);
              if(masonry !== null){
                masonry.addItems($masonryAddTargetItems);
                masonry.layout();
                console.log('layout gogo');
              }else{
                masonry = new window.Masonry($('#document-container').get(0), {
                  itemSelector: '.item'
                });
              }
              $masonryAddTargetItems.removeClass(NOT_INIT_ITEM_CLASS);
            });
          });
      }
    };

    $scope.init = function(){
      $scope.loadMoreDocuments();
    };
  })
  .controller('DocumentRedirectionCtrl', function($scope, Document, $state, $stateParams){
    Document
      .byId({ documentId: $stateParams.documentId })
      .$promise
      .then(function(document){
        $state.go('document', { title: document.title });
      }, function(){
        alertify.alert('올바르지 않은 문서 주소입니다.');
        $state.go('main');
      });
  });
