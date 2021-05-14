import { Component, Input, Inject } from '@angular/core';
import * as angular from 'angular';
import * as _ from 'lodash';
import {} from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'file-uploader',
  templateUrl: 'file-uploader.component.html',
  styleUrls: ['file-uploader.component.scss'],
})
export class FileUploaderComponent {
  constructor() {}

  CheckForError() {}
}

(function () {
  angular.module('doubtfire.common.file-uploader', []).directive('fileUploader', function () {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'common/file-uploader/file-uploader.tpl.html',
      scope: {
        // Files map a key (file name to be uploaded) to a value (containing a
        // a display name, and the type of file that is to be accepted, where
        // type is one of [document, csv, archive, code, image]
        // E.g.:
        // { file0: { name: 'Silly Name Code', type: 'code'  },
        //   fileX: { name: 'Silly name Shot', type: 'image' } ... }
        files: '=',
        // URL to where image is to be uploaded
        url: '=',
        // Optional HTTP method used to post data (defaults to POST)
        method: '@',
        // Other payload data to pass in the upload
        // E.g.:
        // { unit_id: 10, other: { key: data, with: [array, of, stuff] } ... }
        payload: '=?',
        // Optional function to notify just prior to upload, enables injection of payload for example
        onBeforeUpload: '=?',
        // Optional function to perform on success (with one response parameter)
        onSuccess: '=?',
        // Optional function to perform on failure (with one response parameter)
        onFailure: '=?',
        // Optional function to perform when the upload is successful and about
        // to go back into its default state
        onComplete: '=?',
        // This value is bound to whether or not the uploader is currently uploading
        isUploading: '=?',
        // This value is bound to whether or not the uploader is ready to upload
        isReady: '=?',
        // Shows the names of files to be uploaded (defaults to true)
        showName: '=?',
        // Shows initially as button
        asButton: '=?',
        // Exposed files that are in the zone
        filesSelected: '=?',
        // Whether we have one or many drop zones (default is false)
        singleDropZone: '=?',
        // Whether or not we show the upload button or do we hide it allowing an
        // external trigger to upload (default is true)
        showUploadButton: '=?',
        // Sets this scope variable to a function that can then be triggered externally
        // from outside the scope
        initiateUpload: '=?',
        // What happens when we click cancel on failure
        onClickFailureCancel: '=?',
        // Whether we should reset after upload
        resetAfterUpload: '=?',
      },
      _controller: function ($scope, $timeout) {
        var ACCEPTED_TYPES, checkForError, createUploadZones, ref, refreshShownUploadZones;

        // Accepted upload types with associated data
        ACCEPTED_TYPES = {
          document: {
            extensions: ['pdf', 'ps'],
            icon: 'fa-file-pdf-o',
            name: 'PDF',
          },
          csv: {
            extensions: ['csv', 'xls', 'xlsx'],
            icon: 'fa-file-excel-o',
            name: 'CSV',
          },
          code: {
            extensions: [
              'pas',
              'cpp',
              'c',
              'cs',
              'h',
              'java',
              'py',
              'js',
              'html',
              'coffee',
              'rb',
              'css',
              'scss',
              'yaml',
              'yml',
              'xml',
              'json',
              'ts',
              'r',
              'rmd',
              'rnw',
              'rhtml',
              'rpres',
              'tex',
              'vb',
              'sql',
              'txt',
              'md',
            ],
            icon: 'fa-file-code-o',
            name: 'code',
          },
          image: {
            extensions: ['png', 'bmp', 'tiff', 'tif', 'jpeg', 'jpg', 'gif'],
            name: 'image',
            icon: 'fa-file-image-o',
          },
          zip: {
            extensions: ['zip', 'tar.gz', 'tar'],
            name: 'archive',
            icon: 'fa-file-zip-o',
          },
        };
        if (((ref = $scope.files) != null ? ref.length : void 0) === 0) {
          // Error handling; check if empty files
          throw Error('No files provided to uploader');
        }

        // Whether or not clearEnqueuedFiles is enabled
        $scope.clearEnqueuedUpload = function (upload) {
          upload.model = null;
          return refreshShownUploadZones();
        };

        // Default showName
        if ($scope.showName == null) {
          $scope.showName = true;
        }

        // Default singleDropZone
        if ($scope.singleDropZone == null) {
          $scope.singleDropZone = false;
        }

        // Default asButton
        if ($scope.asButton == null) {
          $scope.asButton = false;
        }

        // Only initially show uploader if not presenting as button
        $scope.showUploader = !$scope.asButton;

        // Default show upload button
        if ($scope.showUploadButton == null) {
          $scope.showUploadButton = true;
        }

        // Default resetAfterUpload to true
        if ($scope.resetAfterUpload == null) {
          $scope.resetAfterUpload = true;
        }

        // When a file is dropped, if there has been rejected files
        // warn the user that that file is not okay
        checkForError = function (upload) {
          var ref1;
          if (((ref1 = upload.rejects) != null ? ref1.length : void 0) > 0) {
            upload.display.error = true;
            upload.rejects = null;
            $timeout(function () {
              return (upload.display.error = false);
            }, 4000);
            return true;
          }
          return false;
        };
        // Called when the model has changed
        $scope.modelChanged = function (newFiles, upload) {
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

        // Will refresh which shown drop zones are shown
        // Only changes if showing one drop zone
        refreshShownUploadZones = function () {
          var firstEmptyZone;
          if ($scope.singleDropZone) {
            // Find the first-most empty model in each zone
            firstEmptyZone = _.find($scope.uploadZones, function (zone) {
              return zone.model == null || zone.model.length === 0;
            });
            if (firstEmptyZone != null) {
              return ($scope.shownUploadZones = [firstEmptyZone]);
            } else {
              return ($scope.shownUploadZones = []);
            }
          }
        };

        // Whether or not drop is supported by this browser - assume
        // true initially, but the drop zone will alter this
        $scope.dropSupported = true;

        // Data required for each upload zone
        createUploadZones = function (files) {
          var zones;
          zones = _.map(files, function (uploadData, uploadName) {
            var type, typeData, zone;
            type = uploadData.type;
            typeData = ACCEPTED_TYPES[type];
            // No typeData found?
            if (typeData == null) {
              throw Error(`Invalid type provided to File Uploader ${type}`);
            }
            zone = {
              name: uploadName,
              model: null,
              accept: "'." + typeData.extensions.join(',.') + "'",
              // Rejected files
              rejects: null,
              display: {
                name: uploadData.name,
                // Font awesome supports PDF (from Document),
                // CSV, Code and Image icons
                icon: typeData.icon,
                type: typeData.name,
                // Whether or not a reject error is shown
                error: false,
              },
            };
            return zone;
          });
          // Remove all but the active drop zone
          if ($scope.singleDropZone) {
            $scope.shownUploadZones = [_.first(zones)];
          } else {
            $scope.shownUploadZones = zones;
          }
          return ($scope.uploadZones = zones);
        };
        createUploadZones($scope.files);

        // Watch for changes in the files, and recreate the zones when
        // they do change
        $scope.$watch('files', function (files, oldFiles) {
          return createUploadZones(files);
        });

        // Checks if okay to upload (i.e., file models exist for each drop zone)
        $scope.readyToUpload = function () {
          var upload;
          return ($scope.isReady =
            _.compact(
              _.flatten(
                (function () {
                  var i, len, ref1, results;
                  ref1 = $scope.uploadZones;
                  results = [];
                  for (i = 0, len = ref1.length; i < len; i++) {
                    upload = ref1[i];
                    results.push(upload.model);
                  }
                  return results;
                })()
              )
            ).length === _.keys($scope.files).length);
        };

        // Resets the uploader and call it
        $scope.resetUploader = function () {
          var i, len, ref1, results, upload;
          // No upload info and we're not uploading
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

        // Override on click failure cancel if not set to just reset uploader
        if ($scope.onClickFailureCancel == null) {
          $scope.onClickFailureCancel = $scope.resetUploader;
        }

        // Initiates the upload
        return ($scope.initiateUpload = function () {
          var file, files, form, i, j, k, len, len1, payload, payloadItem, v, xhr, zone;
          if (!$scope.readyToUpload()) {
            return;
          }
          if (typeof $scope.onBeforeUpload === 'function') {
            $scope.onBeforeUpload();
          }
          xhr = new XMLHttpRequest();
          form = new FormData();
          // Append data
          files = (function () {
            var i, len, ref1, results;
            ref1 = $scope.uploadZones;
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
              zone = ref1[i];
              results.push({
                name: zone.name,
                data: zone.model[0],
              });
            }
            return results;
          })();
          for (i = 0, len = files.length; i < len; i++) {
            file = files[i];
            form.append(file.name, file.data);
          }
          // Append payload
          payload = (function () {
            var ref1, results;
            ref1 = $scope.payload;
            results = [];
            for (k in ref1) {
              v = ref1[k];
              results.push({
                key: k,
                value: v,
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
          // Set the percent
          $scope.uploadingInfo = {
            progress: 5,
            success: null,
            error: null,
            complete: false,
          };
          $scope.isUploading = true;
          // Callbacks
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              return $timeout(function () {
                var e, response;
                // Upload is now complete
                $scope.uploadingInfo.complete = true;
                response = null;
                try {
                  response = JSON.parse(xhr.responseText);
                } catch (error) {
                  e = error;
                  if (xhr.status === 0) {
                    response = {
                      error: 'Could not connect to the Doubtfire server',
                    };
                  } else {
                    response = xhr.responseText;
                  }
                }
                // Success (20x success range)
                if (xhr.status >= 200 && xhr.status < 300) {
                  if (typeof $scope.onSuccess === 'function') {
                    $scope.onSuccess(response);
                  }
                  $scope.uploadingInfo.success = true;
                  $timeout(function () {
                    if (typeof $scope.onComplete === 'function') {
                      $scope.onComplete();
                    }
                    if ($scope.resetAfterUpload) {
                      return $scope.resetUploader();
                    }
                  }, 2500);
                } else {
                  if (typeof $scope.onFailure === 'function') {
                    $scope.onFailure(response);
                  }
                  $scope.uploadingInfo.success = false;
                  $scope.uploadingInfo.error = response.error || 'Unknown error';
                }
                return $scope.$apply();
              }, 2000);
            }
          };
          xhr.upload.onprogress = function (event) {
            $scope.uploadingInfo.progress = parseInt((event.position * 100.0) / event.totalSize);
            return $scope.$apply();
          };
          if ($scope.method == null) {
            // Default the method to POST if it was not defined
            $scope.method = 'POST';
          }
          // Send it
          xhr.open($scope.method, $scope.url, true);
          return xhr.send(form);
        });
      },
      get controller_1() {
        return this._controller;
      },
      set controller_1(value) {
        this._controller = value;
      },
      get controller() {
        return this._controller;
      },
      set controller(value) {
        this._controller = value;
      },
    };
  });
}.call(this));
