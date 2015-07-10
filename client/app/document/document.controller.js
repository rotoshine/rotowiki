'use strict';

angular.module('rotowikiApp')
  .controller('DocumentCtrl', function ($scope, $rootScope, $sce, Auth, Document, $state, $stateParams, WIKI_NAME, markdownService) {
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
          var markdownAndComment = markdownService.applyComment(document.content);
          
          document.content = markdownAndComment.markdownText;
          $scope.commentText = $sce.trustAsHtml(markdownAndComment.commentText);
          
          document.alreadyLike = _.contains(document.likeUsers, Auth.getCurrentUser()._id);

          $scope.document = document;

          window.document.title = WIKI_NAME + ' - ' + document.title;
          setTimeout(function(){
            window.Prism.highlightAll();
            /*new window.Masonry($('#markdown-view').get(0), {
              itemSelector: '.discography'
            });*/
            
            // 이미지가 404일 때...
            // rm -rf를 조심하자 ㅜㅠ
            $('img').on('error', function(){
              $(this).attr('src', '/assets/images/cute_cat_404_error_im_sorry.jpg');  
            });
            
            // 뒤에 해시 붙은 경우
            var hash = location.hash;
            if(hash !== ''){              
              $(window).scrollTop(
                $(hash).offset().top
              );
            }
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
                  parents: [$scope.document._id]
                }, function(){
                  $state.go('document edit', {title: title});
                });
            });
        }
      });
    };
  })
  .controller('DocumentEditCtrl', function($scope, Auth, Document, $state, $stateParams, $location, $modal, markdownService, $upload, $rootScope, WIKI_NAME, $timeout, socket) {
    var editDocumentBackup = {
      // 10초 단위로 현재 편집 중인 문서를 localStorage에 백업한다.
      // 저장하면서 날려버리자.
      KEY_PREFIX: 'backup-',
      getKey: function(documentId){
        if(documentId === undefined || documentId === null){
          throw new Error('documentId가 잘못 되었습니다.');
        }
        return this.KEY_PREFIX + documentId;
      },
      backupEditing: function(documentId){
        window.localStorage[this.getKey(documentId)] = getEditingContentValue();
      },
      loadBackup: function(documentId){
        return localStorage[this.getKey(documentId)];
      },
      remove: function(documentId){
        window.localStorage.removeItem(this.getKey(documentId));
      },
      exists: function(documentId){
        return window.localStorage.getItem(this.getKey(documentId)) !== null;
      },
      backupStart: function(documentId){
        var that = this;
        setInterval(function(){
          that.backupEditing(documentId);
        }, 1000 * 10);
      }
    };
   
    $scope.showDocumentHelper;
    if(window.localStorage.getItem('showDocumentHelper') !== null){
      $scope.showDocumentHelper = !!window.localStorage.showDocumentHelper;  
    }else{
      $scope.showDocumentHelper = false;
    }
 
    $scope.saveShowDocumentHelper = function(isShow){
      window.localStorage.showDocumentHelper = $scope.showDocumentHelper;
    };
    
    function simpleTemplate(text, data){
      for(var key in data){
        var regExp = new RegExp('{' + key + '}', 'g');
        if(data.hasOwnProperty(key)){
          text = text.replace(regExp, data[key]);
        }
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

    var fileUrl = null;
    $scope.imageUpload = function ($files) {
      if(fileUrl !== null){
        if ($files.length === 1) {
          $upload.upload({
            file: $files[0],
            url: fileUrl
          }).success(function (uploadedFile) {
            var imgTag = simpleTemplate('![{title}의 이미지]({imageUrl})', {
                title: $stateParams.title,
                imageUrl: fileUrl + '/' + uploadedFile._id
              }) + CARRIAGE_RETURN_CHAR;
            $scope.appendHTML(imgTag);
            
            if($scope.uploadedFiles !== null){
              $scope.uploadedFiles.push(uploadedFile);
            }
          }).error(function () {
            alertify.alert('파일 업로드 중 에러가 발생했습니다.');
          });
        }  
      }else{
        alertify.alert('파일 업로드가 뭔가 이상합니다. 개발자를 갈요.');  
      }
    };
    
    $scope.removeUploadedFile = function(uploadedFile, $index){
        Document.removeFile({
          documentId: $scope.document._id,
          fileId: uploadedFile._id
        }, function(){
          $scope.uploadedFiles.splice($index, 1);  
          
          // 본문에서 이미지 삭제
          var fileRemoveRegex = new RegExp('!\\[.*' + uploadedFile._id + '\\)', 'gm');
          var content = getEditingContentValue();
          
          console.log(fileRemoveRegex);
          content = content.replace(fileRemoveRegex, '');
          setEditingContentValue(content);
        });
    };
    
    $scope.appendUploadedFile = function(uploadedFile){
      var imgTag = simpleTemplate('![{title}의 이미지]({imageUrl})', {
        title: $stateParams.title,
        imageUrl: fileUrl + '/' + uploadedFile._id
      }) + CARRIAGE_RETURN_CHAR;
      
      if($scope.editor === null){
        document.content = document.content + imgTag;
      }else{
        $scope.appendHTML(imgTag);
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

    var getEditingContentValue = function(){
      var content;
      if($scope.editor === null){
        content = $scope.document.content;
      }else{
        content = $scope.editor.getValue();
      }
      return content;
    };

    var setEditingContentValue = function(content){
      if($scope.editor === null){
        $scope.document.content = content;
      }else{
        $scope.editor.setValue(content);
        $scope.editor.gotoLine($scope.currentCursor.row, 0);
      }
    }
    
    $scope.markdownRender = function(){
      $scope.markdownToHTML = markdownService.toHTML(getEditingContentValue());

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
          
          // file url setting
          fileUrl = '/api/documents/by-id/' + document._id + '/files';
          $scope.fileUrl = fileUrl;
          
          $scope.changedDocumentTitle = document.title;
          if ($scope.document.content === undefined) {
            $scope.document.content = '';
          }

          $scope.editingBeforeContent = $scope.document.content;

          // wide 환경인 경우에만 적용
          if($('#ace-editor').css('display') !== 'none'){
            $scope.initAceEditor();
          }
          
          
          var documentId = document._id;
          
          Document
            .findFiles({documentId: documentId})
            .$promise.then(function(files){
              $scope.uploadedFiles = files;
            });
            
          // 기존 편집본 있나 체크
          if(editDocumentBackup.exists(documentId) && 
              editDocumentBackup.loadBackup(documentId) !== getEditingContentValue()){
            alertify.confirm('기존에 편집 중인 문서가 있습니다. 불러오시겠습니까?', function(ok){
              if(ok){
                setEditingContentValue(editDocumentBackup.loadBackup(documentId));
              }
              editDocumentBackup.remove(documentId);
              editDocumentBackup.backupStart(documentId);
            });
          }else{
            editDocumentBackup.backupStart(documentId);
          }
          
          $scope.$on('$locationChangeStart', function(event, newUrl){
            // TODO 로그인 세션이 끊겨서 로그인 화면으로 보내는거면 그냥 보내게 처리하자.
            var content = getEditingContentValue();
            if(content !== $scope.editingBeforeContent){
              event.preventDefault();
              alertify.confirm('변경된 내용이 저장되지 않았습니다. 편집 모드를 종료하시겠습니까?', function(ok){
                if(ok){
                  // FIXME 이 방식으로 하면 화면전체를 새로고침한다. $location.path가 안 먹는데 대안을 찾아보자.
                  location.href = newUrl;
                }
              });
            }
          });
        });
    };

    $scope.initAceEditor = function(){
      $timeout(function(){
        var ace = window.ace;

        var editor = ace.edit('ace-editor');
        editor.on('blur', function (event, editor) {
          $scope.currentCursor = editor.selection.getCursor();
        });
        editor.on('change', function(){
          $scope.isChanged = true;
        });
        var MarkdownMode = ace.require('ace/mode/markdown').Mode;

        editor.getSession().setMode(new MarkdownMode());
        editor.setOptions({
          minLines: 20,
          maxLines: Infinity,
          autoScrollEditorIntoView: true,
          theme: "ace/theme/clouds",
          showPrintMargin: false
        });
        editor.resize();
        editor.focus();
        $scope.editor = editor;
      });
    };

    $scope.isNowSaving = false;
    $scope.save = function () {
      $scope.isNowSaving = true;

      var saveDocument = {
        title: $scope.document.title
      };

      saveDocument.content = getEditingContentValue();


      if ($scope.changedDocumentTitle !== $scope.document.title){
        saveDocument.changedDocumentTitle = $scope.changedDocumentTitle;
      }

      if($scope.document.parents.length > 0){
        saveDocument.parents = _.pluck($scope.document.parents, '_id');  
      }
      
      var isFirstUpdate = $scope.document.__v === 0;
      var updateBeforeDate = $scope.document.updatedAt;

      Document
        .update(saveDocument)
        .$promise
        .then(function (updatedDocument) {
          editDocumentBackup.remove(updatedDocument._id);
          if(isFirstUpdate){
            socket.socket.emit('document:create', angular.toJson(updatedDocument));
          }else{
            var beforeUpdatedSeconds = (new Date() - new Date(updateBeforeDate) ) / 1000;
            if(beforeUpdatedSeconds > 30){
              socket.socket.emit('document:update', angular.toJson(updatedDocument));
            }
          }
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
          keyboard: false,
          resolve: {
            currentDocument: function () {
              return $scope.document;
            }
          }
        });

        modalInstance.result.then(function (parentDocuments) {
          if(parentDocuments !== null){
            $scope.document.parents = parentDocuments;
            $scope.hasChangeParentDocument = true;
          }
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
        var adjustRow = 1;
        if($scope.currentCursor.column > 0){
          adjustRow = adjustRow + 1;
        }
        editor.gotoLine($scope.currentCursor.row + adjustRow, 0);
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
  })
  .controller('DocumentParentChangeCtrl', function($scope, $modalInstance, Document, currentDocument){
    setTimeout(function(){
      $('#document-search-query').focus();
    }, 500);
    $scope.currentDocument = currentDocument;
    
    $scope.hide = function(){
      $modalInstance.dismiss('cancel');
    };

    $scope.searchComplete = false;
    
    $scope.searchHandler = function(query, $e){
      // 검색결과 순회를 위해 위, 아래 키를 눌렀을 때는 검색이 안 되도록.
      var keyCode = $e.keyCode;
      
      if(keyCode !== KEY_CODE.UP && keyCode !== KEY_CODE.DOWN){
        $scope.search(query);
      }
    };
    
    $scope.search = function(query){
      if(query !== undefined && query.length > 0){
        if(query === $scope.currentDocument.title){
          $scope.parentAndSubSameError = true;
        }else {
          $scope.parentAndSubSameError = false;
          $scope.isNowSearching = true;
          Document
            .query({
              title: query
            })
            .$promise.then(function (documents) {
              $scope.isNowSearching = false;
              
              var parentsIds = _.pluck($scope.currentDocument.parents, '_id');
              for(var i = 0; i < documents.length; i++){
                documents[i].selected = i === 0;        
                
                if(_.include(parentsIds, documents[i]._id)){
                  documents.splice(i, 1);
                  i--;
                }
                
              }
              
              $scope.searchResults = documents;
              $scope.searchComplete = true; 
              adjustSearchResultPosition();
            }, function () {
              $scope.isNowSearching = false;
              $scope.searchResults = [];
              $scope.searchComplete = true;
              adjustSearchResultPosition();
            });
        }
      }
    };
    
    $scope.selectParent = function(document){
      $scope.searchComplete = false;
      $scope.searchResults = [];   
      $scope.currentDocument.parents.push(document);
    };
    
    var KEY_CODE = {
      'UP': 38,
      'DOWN': 40,
      'ENTER': 13,
      'ESC': 27
    };
    
    function isControlingKeyDown(keyCode){
      for(var key in KEY_CODE){
        if(KEY_CODE[key] === keyCode){
          return true;
        }
      }
      return false;
    }
    
    
    // TODO jquery로 직접 핸들링하는 부분들을 angular code base로 바꾸자.
    function adjustSearchResultPosition(){
      if($scope.searchResultShow){
        var $searchField = $('#document-search-query');
        var position = $searchField.position();
        var inputPaddingLeft = parseInt($searchField.css('padding-left').replace('px', ''));
        var fontSize = parseInt($searchField.css('font-size').replace('px', ''));
        $('#parent-document-search-result').css({
          top: position.top,
          left: position.left + inputPaddingLeft + (fontSize * $searchField.val().length)
        });
      }
    }
    
    function resetSelected(){
      for(var i = 0; i < $scope.searchResults.length; i++){
        $scope.searchResults[i].selected = false;
      }
    }
    
    function adjustSearchResultSelectedIndex(adjustValue){
      if($scope.searchResults.length > 1){
        var selectedIndex, i;
        
        // 현재 검색결과의 선택위치를 구함.
        for(i = 0; i < $scope.searchResults.length; i++){
          console.log($scope.searchResults[i].selected);
          if($scope.searchResults[i].selected){
            selectedIndex = i;
            break;
          }
        }
        
        var adjustIndex = selectedIndex + adjustValue;
        console.log('adjustIndex:' + adjustIndex);
        if(adjustIndex < 0){
          adjustIndex = 0;
        }else if(adjustIndex > $scope.searchResults.length - 1){
          adjustIndex = $scope.searchResults.length - 1;
        }
        console.log('보정된 adjustIndex:' + adjustIndex);
        
        // 보정된 값으로 선택위치를 설정.
        resetSelected();
        $scope.searchResults[adjustIndex].selected = true;
        
        $scope.$apply();
      }  
    }
    
    $scope.mouseEnterEffect = function($index){
      resetSelected();
      $scope.searchResults[$index].selected = true;
    };
    
    $scope.searchResultShow = false;
    
    function keyControlHandle(e){
      var keyCode = e.keyCode;
      
      if($scope.searchComplete && $scope.searchResults.length > 0){
        $scope.searchResultShow = true;
        if(isControlingKeyDown(keyCode)){
          if(keyCode === KEY_CODE.UP || keyCode === KEY_CODE.DOWN){
            e.preventDefault();
            adjustSearchResultSelectedIndex(keyCode === KEY_CODE.UP ? -1 : 1);
          }else if(keyCode === KEY_CODE.ENTER){
            for(var i = 0; i < $scope.searchResults.length; i++){
              if($scope.searchResults[i].selected){
                $scope.selectParent($scope.searchResults[i]);
                break;
              }
            }
          }
        }
      } 
      
      if(keyCode === KEY_CODE.ESC){
        e.preventDefault();
        if($scope.searchResultShow){
          $scope.searchResultShow = false; 
          $scope.documentSearchQuery = ''; 
        }else{
          $modalInstance.close(null);
        }
      }
    }
    
    function keydownHandler(e){
      adjustSearchResultPosition();
      keyControlHandle(e);
    }
    
    $(window).on('keydown', keydownHandler);
    
    $scope.removeParentDocument = function($index){
      $scope.currentDocument.parents.splice($index, 1);
    };
    
    $scope.applyChange = function(){
      $(window).off('keydown', keydownHandler);
      console.log($scope.currentDocument.parents.length);
      $modalInstance.close($scope.currentDocument.parents);
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
          if($scope.linkTypes.hasOwnProperty(key)){
            $scope.linkTypes[key].linkObject = null;
          }
        }
      }
    };

    $scope.hide = function(){
      for(var key in $scope.linkTypes){
        if($scope.linkTypes.hasOwnProperty(key)){
          $scope.linkTypes[key].linkObject = null;
        }
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
  })
  .controller('DocumentListCtrl', function($scope, Document){
    $scope.rootDocuments = [];
    $scope.page = {
      currentPage: 1,
      pageCount: 10,
      isArriveLast: false
    };
    
    $scope.isNowLoading = false;
    
    $scope.loadRootDocuments = function(callback){
      if($scope.page.isArriveLast || $scope.isNowLoading){
        if(callback){
            return callback();  
          }
      }else{
        $scope.isNowLoading = true;
        
        // subDocument 없는 문서들 로드  
        return Document
          .findByNoParents({
            page: $scope.page.currentPage      
          },function(rootDocuments){
            $scope.page.currentPage = $scope.page.currentPage + 1;
            if($scope.page.pageCount > rootDocuments.length){
              $scope.page.isArriveLast = true;
            }
            for(var i = 0; i < rootDocuments.length; i++){
              rootDocuments[i].hoverable = rootDocuments[i].subDocumentsCount > 0;
            }
            $scope.rootDocuments = $scope.rootDocuments.concat(rootDocuments);
            
            $scope.isNowLoading = false;
            if(callback){
              return callback(rootDocuments);  
            }
            
        });  
      }
    };
    
    $scope.init = function(){
      $scope.loadRootDocuments();
    };
  }); 
