<div class="card card-default card-sm" ng-show="submission.isUploaded || submission.isProcessing">
  <div class="card-heading"> 
    <h4>
      Submission
      <span ng-show="submission.isProcessing">Processing</span>       
    </h4>
  </div><!--/card-heading-->
  <div class="card-body" >
    <p ng-show="submission.isProcessing">
      Your submission is being processed and will be avaliable to view soon. You will also
      be able to download your most recently submitted files.
    </p>
    <p ng-show="submission.isUploaded">
      You can choose to download your <em ng-show="submission.isProcessing">previous</em>
      submission or the files you uploaded below.
    </p>
    <p ng-show="submission.isUploaded">
      You uploaded this submission <strong>{{task.submission_date | humanizedDate}}</strong>.
    </p>
    <p ng-show="canRegeneratePdf">
      If you feel there has been an error in your submission, you can request Doubtfire to
      regenerate your submission under the "Actions" dropdown menu.
    </p>
    <p ng-show="canReuploadEvidence">
      If you would like to submit alternate evidence for use in your portfolio, you can
      upload alternate files under the "Actions" dropdown menu.
    </p>
  </div><!--/card-body-->
  <div class="card-footer clearfix" ng-show="submission.isUploaded || canReuploadEvidence || canRegeneratePdf">
    <div class="btn-group" ng-show="submission.isUploaded" dropdown>
      <a href="{{urls.pdf}}" target="_blank" class="btn btn-primary">
        <i class="fa fa-download"></i>
        Download Submission
      </a>
      <button class="btn btn-primary" dropdown-toggle>
        <span class="caret"></span>
      </button>
      <ul class="dropdown-menu">
        <li>
          <a href="{{urls.files}}" target="_blank">
            Download Uploaded Files
          </a>
        </li>
      </ul>
    </div><!--/download-submission-->
    <div class="task-status pull-right" ng-show="canReuploadEvidence || canRegeneratePdf" dropdown>
      <button type="button" class="btn btn-default" dropdown-toggle>
        Actions <span class="caret"></span>
      </button>
      <ul class="dropdown-menu" dropdown-menu>
        <li ng-show="canReuploadEvidence">
          <a ng-click="uploadAlternateFiles()">Upload Alternate Files</a>
        </li> 
        <li ng-show="canReuploadEvidence">
          <a ng-click="uploadAlternateFiles()">Upload Alternate Files</a>
        </li>  
        <li ng-show="canRegeneratePdf">
          <a ng-click="regeneratePdf()">Regenerate PDF</a>
        </li>
      </ul>
    </div><!--/more-dropdown-->
    <br>
    <div class="group-member-contribution-assessment">
    <table class="table table-condensed table-hover">
    <thead> 
        <tr> 
          <th> Comment </th>
          <th> Type </th>
          <th> Marker </th>
          <th> Read Date </th>
        </tr>                                             
    </thead>
    <tbody>
      <tr ng-repeat="comment in task.comments">
        <td>{{ comment.comment}}</td>         
        <td>{{ comment.type}}</td>          
        <td>{{ comment.author.name}}</td>
        <td>{{ comment.recipient_read_time}}</td>       
      </tr>
    </tbody>
  </table>                  
</div>
  </div><!--/card-footer-->
</div><!--/card-->