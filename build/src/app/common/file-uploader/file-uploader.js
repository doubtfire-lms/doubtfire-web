angular.module('doubtfire.common.file-uploader', []).directive('fileUploader', function() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'common/file-uploader/file-uploader.tpl.html',
    scope: {
      files: '=',
      url: '=',
      method: '@',
      payload: '=?',
      onBeforeUpload: '=?',
      onSuccess: '=?',
      onFailure: '=?',
      onComplete: '=?',
      isUploading: '=?',
      isReady: '=?',
      showName: '=?',
      asButton: '=?',
      filesSelected: '=?',
      singleDropZone: '=?',
      showUploadButton: '=?',
      initiateUpload: '=?',
      onClickFailureCancel: '=?',
      resetAfterUpload: '=?'
    },
    controller: ["$scope", "$timeout", "currentUser", function($scope, $timeout, currentUser) {
      var ACCEPTED_TYPES, checkForError, createUploadZones, ref, refreshShownUploadZones;
      ACCEPTED_TYPES = {
        document: {
          extensions: ['pdf', 'ps'],
          icon: 'fa-file-pdf-o',
          name: 'PDF'
        },
        csv: {
          extensions: ['csv', 'xls', 'xlsx'],
          icon: 'fa-file-excel-o',
          name: 'CSV'
        },
        code: {
          extensions: ['pas', 'cpp', 'c', 'cs', 'h', 'java', 'py', 'js', 'html', 'coffee', 'rb', 'css', 'scss', 'yaml', 'yml', 'xml', 'json', 'ts', 'r', 'rmd', 'rnw', 'rhtml', 'rpres', 'tex', 'vb', 'sql', 'txt', 'md', 'jack', 'hack', 'asm', 'hdl', 'tst', 'out', 'cmp', 'vm', 'sh', 'bat', 'dat', 'ipynb'],
          icon: 'fa-file-code-o',
          name: 'code'
        },
        image: {
          extensions: ['png', 'bmp', 'tiff', 'tif', 'jpeg', 'jpg', 'gif'],
          name: 'image',
          icon: 'fa-file-image-o'
        },
        zip: {
          extensions: ['zip', 'tar.gz', 'tar'],
          name: 'archive',
          icon: 'fa-file-zip-o'
        }
      };
      if (((ref = $scope.files) != null ? ref.length : void 0) === 0) {
        throw Error("No files provided to uploader");
      }
      $scope.clearEnqueuedUpload = function(upload) {
        upload.model = null;
        return refreshShownUploadZones();
      };
      if ($scope.showName == null) {
        $scope.showName = true;
      }
      if ($scope.singleDropZone == null) {
        $scope.singleDropZone = false;
      }
      if ($scope.asButton == null) {
        $scope.asButton = false;
      }
      $scope.showUploader = !$scope.asButton;
      if ($scope.showUploadButton == null) {
        $scope.showUploadButton = true;
      }
      if ($scope.resetAfterUpload == null) {
        $scope.resetAfterUpload = true;
      }
      checkForError = function(upload) {
        var ref1;
        if (((ref1 = upload.rejects) != null ? ref1.length : void 0) > 0) {
          upload.display.error = true;
          upload.rejects = null;
          $timeout((function() {
            return upload.display.error = false;
          }), 4000);
          return true;
        }
        return false;
      };
      $scope.modelChanged = function(newFiles, upload) {
        var gotError;
        if (!(newFiles.length > 0 || upload.rejects.length > 0)) {
          return;
        }
        gotError = checkForError(upload);
        if (!gotError) {
          $scope.filesSelected = _.flatten(_.map($scope.uploadZones, 'model'));
          if ($scope.singleDropZone) {
            $scope.selectedFiles = $scope.uploadZones;
            return refreshShownUploadZones();
          }
        }
      };
      refreshShownUploadZones = function() {
        var firstEmptyZone;
        if ($scope.singleDropZone) {
          firstEmptyZone = _.find($scope.uploadZones, function(zone) {
            return (zone.model == null) || zone.model.length === 0;
          });
          if (firstEmptyZone != null) {
            return $scope.shownUploadZones = [firstEmptyZone];
          } else {
            return $scope.shownUploadZones = [];
          }
        }
      };
      $scope.dropSupported = true;
      createUploadZones = function(files) {
        var zones;
        zones = _.map(files, function(uploadData, uploadName) {
          var type, typeData, zone;
          type = uploadData.type;
          typeData = ACCEPTED_TYPES[type];
          if (typeData == null) {
            throw Error("Invalid type provided to File Uploader " + type);
          }
          zone = {
            name: uploadName,
            model: null,
            accept: "'." + typeData.extensions.join(',.') + "'",
            rejects: null,
            display: {
              name: uploadData.name,
              icon: typeData.icon,
              type: typeData.name,
              error: false
            }
          };
          return zone;
        });
        if ($scope.singleDropZone) {
          $scope.shownUploadZones = [_.first(zones)];
        } else {
          $scope.shownUploadZones = zones;
        }
        return $scope.uploadZones = zones;
      };
      createUploadZones($scope.files);
      $scope.$watch('files', function(files, oldFiles) {
        return createUploadZones(files);
      });
      $scope.readyToUpload = function() {
        var upload;
        return $scope.isReady = _.compact(_.flatten((function() {
          var i, len, ref1, results;
          ref1 = $scope.uploadZones;
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            upload = ref1[i];
            results.push(upload.model);
          }
          return results;
        })())).length === _.keys($scope.files).length;
      };
      $scope.resetUploader = function() {
        var i, len, ref1, results, upload;
        $scope.uploadingInfo = null;
        $scope.isUploading = false;
        $scope.showUploader = !$scope.asButton;
        ref1 = $scope.uploadZones;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          upload = ref1[i];
          results.push($scope.clearEnqueuedUpload(upload));
        }
        return results;
      };
      $scope.resetUploader();
      if ($scope.onClickFailureCancel == null) {
        $scope.onClickFailureCancel = $scope.resetUploader;
      }
      return $scope.initiateUpload = function() {
        var file, files, form, i, j, k, len, len1, payload, payloadItem, v, xhr, zone;
        if (!$scope.readyToUpload()) {
          return;
        }
        if (typeof $scope.onBeforeUpload === "function") {
          $scope.onBeforeUpload();
        }
        xhr = new XMLHttpRequest();
        form = new FormData();
        files = (function() {
          var i, len, ref1, results;
          ref1 = $scope.uploadZones;
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            zone = ref1[i];
            results.push({
              name: zone.name,
              data: zone.model[0]
            });
          }
          return results;
        })();
        for (i = 0, len = files.length; i < len; i++) {
          file = files[i];
          form.append(file.name, file.data);
        }
        payload = (function() {
          var ref1, results;
          ref1 = $scope.payload;
          results = [];
          for (k in ref1) {
            v = ref1[k];
            results.push({
              key: k,
              value: v
            });
          }
          return results;
        })();
        for (j = 0, len1 = payload.length; j < len1; j++) {
          payloadItem = payload[j];
          if (_.isObject(payloadItem.value)) {
            payloadItem.value = JSON.stringify(payloadItem.value);
          }
          form.append(payloadItem.key, payloadItem.value);
        }
        $scope.uploadingInfo = {
          progress: 5,
          success: null,
          error: null,
          complete: false
        };
        $scope.isUploading = true;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            return $timeout((function() {
              var e, error, response;
              $scope.uploadingInfo.complete = true;
              response = null;
              try {
                response = JSON.parse(xhr.responseText);
              } catch (error) {
                e = error;
                if (xhr.status === 0) {
                  response = {
                    error: 'Could not connect to the Doubtfire server'
                  };
                } else {
                  response = xhr.responseText;
                }
              }
              if (xhr.status >= 200 && xhr.status < 300) {
                if (typeof $scope.onSuccess === "function") {
                  $scope.onSuccess(response);
                }
                $scope.uploadingInfo.success = true;
                $timeout((function() {
                  if (typeof $scope.onComplete === "function") {
                    $scope.onComplete();
                  }
                  if ($scope.resetAfterUpload) {
                    return $scope.resetUploader();
                  }
                }), 2500);
              } else {
                if (typeof $scope.onFailure === "function") {
                  $scope.onFailure(response);
                }
                $scope.uploadingInfo.success = false;
                $scope.uploadingInfo.error = response.error || "Unknown error";
              }
              return $scope.$apply();
            }), 2000);
          }
        };
        xhr.upload.onprogress = function(event) {
          $scope.uploadingInfo.progress = parseInt(100.0 * event.position / event.totalSize);
          return $scope.$apply();
        };
        if ($scope.method == null) {
          $scope.method = 'POST';
        }
        xhr.open($scope.method, $scope.url, true);
        xhr.setRequestHeader('Auth-Token', currentUser.authenticationToken);
        xhr.setRequestHeader('Username', currentUser.profile.username);
        return xhr.send(form);
      };
    }]
  };
});
