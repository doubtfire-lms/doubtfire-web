//
// Modal to show Doubtfire version info
//

angular
  .module("doubtfire.common.modals.about-doubtfire-modal", [])
  .factory("AboutDoubtfireModal", AboutDoubtfireModal)
  .controller('AboutDoubtfireModalCtrl', AboutDoubtfireModalCtrl);

function AboutDoubtfireModal($modal)
{
  const AboutDoubtfireModal = this;

  AboutDoubtfireModal.show = () =>
    $modal.open({
      templateUrl: 'common/modals/about-doubtfire-modal/about-doubtfire-modal.tpl.html',
      controller: 'AboutDoubtfireModalCtrl',
      size: 'lg'
    });

  return AboutDoubtfireModal;
}

function AboutDoubtfireModalCtrl($scope, ExternalName, DoubtfireContributors, $modalInstance, $http)
{
  var vm = $scope;
  vm.contributors = mapContributors();
  vm.close = () => $modalInstance.dismiss();
  // Get the confugurable, external name of Doubtfire
  vm.externalName = ExternalName;
  vm.loadContributorDetails = loadContributorDetails;

  // Load in the contributors from GitHub
  for (let index = 0; index < vm.contributors.length; index++)
  {
    vm.loadContributorDetails(vm.contributors[index].handler, index);
  }

  // Map contributors to initial hashes - with handler and default avatar
  function mapContributors()
  {
    return _.map(DoubtfireContributors, (c) =>
      ({
        avatar:   '/assets/images/person-unknown.gif',
        handler:  c
      })
    );
  }

  function loadContributorDetails(handler, index)
  {
    $http.get(`https://api.github.com/users/${handler}`)
      .then( (response) =>
      {
        const { data } = response;

        // Include http:// if the blog entry does not include "xxxx://"
        if (data.blog && !data.blog.match(/^[a-zA-Z]+:\/\//))
        { 
          data.blog = `http://${data.blog}`; 
        }

        vm.contributors[index] = {
          name:     data.name,
          avatar:   data.avatar_url || '/assets/images/person-unknown.gif',
          website:  data.blog || data.html_url,
          github:   data.html_url,
          handler
          };
      }
    );
  }
}