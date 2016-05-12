angular.module('roleCtrl', ['userService',
  'mgcrea.ngStrap'
])

.controller('AddApplicantController',
  function(Applicant, Role, $location, $routeParams, $rootScope,
    $scope, $aside, $routeParams, $location, $route, $window) {
    var vm = this;
    vm.processing = true;
    vm.back = function() {
      $window.history.back();
    }
    Role.get($routeParams.role_id)
      .success(function(data) {
        console.log(data)
        vm.processing = false;
        vm.role = data.data;
        var now = new Date()
        var endDate = new Date(data.data.end_date);
        var timeDiff = endDate - now;
        var left = Math.ceil(timeDiff / (1000 * 3600 * 24));
        //calculate 
        if (left < 8) { //only alert when 7 days left
          /*if (left > 0) { //larger than 0
          }*/
          if (left > 1) {
            vm.remaining = left + " days left";
            vm.prjClosed;
            return;
          } else if (left === 1) {
            vm.remaining = "Ends today";
            vm.prjClosed;
            return;
          } else if (left < 0) {
            vm.remaining = "";
            vm.prjClosed = "(Closed)";
          } else {
            vm.prjClosed = "";
            vm.remaining = "";
          }
        }
      })
      .error(function(error) {
        console.log(error);
      })
  })

.controller('RolePageController',
  function(Applicant, Role, $location, $routeParams, $rootScope,
    $scope, $aside, $routeParams, $location, $route, $window) {
    var vm = this;
    var editRoleAside = $aside({
        scope: $scope,
        backdrop: 'static',
        show: false,
        controller: 'editRoleController',
        container: "body",
        controllerAs: 'roleAside',
        templateUrl: '/app/views/pages/role_form.tmpl.html'
      }),
      shareRoleAside = $aside({
        scope: $scope,
        show: false,
        keyboard: true,
        controller: 'shareRoleController',
        controllerAs: 'roleAside',
        templateUrl: '/app/views/pages/role_share.tmpl.html'
      }),
      deleteRoleAside = $aside({
        scope: $scope,
        keyboard: true,
        show: false,
        controller: 'deleteRoleController',
        controllerAs: 'aside',
        templateUrl: '/app/views/pages/role_delete.tmpl.html'
      }),
      deleteAppAside = $aside({
        scope: $scope,
        keyboard: true,
        show: false,
        templateUrl: '/app/views/pages/applicant_delete.tmpl.html'
      });
    $scope.viewApp = false;
    $scope.carouselIndex = 0;
    $scope.slides = [];
    vm.gridView = true;
    vm.listView = false;

    Role.get($routeParams.role_id)
      .success(function(data) {
        if (data.client === "public") {
          $location.path('Apply/' + $routeParams.role_id)
        }
        vm.processing = false;
        $scope.roleData = data.data;
        if ($scope.roleData) {
          getApps();

          var now = new Date()
          var endDate = new Date(data.data.end_date);
          var timeDiff = endDate - now;
          var left = Math.ceil(timeDiff / (1000 * 3600 * 24));
          //calculate 
          if (left < 8) { //only alert when 7 days left
            /*if (left > 0) { //larger than 0
            }*/
            if (left > 1) {
              vm.remaining = left + " days left";
              vm.prjClosed;
              return;
            } else if (left === 1) {
              vm.remaining = "Ends today";
              vm.prjClosed;
              return;
            } else if (left < 0) {
              vm.remaining = "";
              vm.prjClosed = "(Closed)";
            } else {
              vm.prjClosed = "";
              vm.remaining = "";
            }
          }
        }
      })
      .error(function(error) {
        console.log(error);
      })

    function getApps() {
      Applicant.getAll($routeParams.role_id)
        .success(function(data) {
          vm.processing = false;
          vm.applicants = data.data;
          $scope.numApps = data.data.length;
          //get headshot
          for (var i in vm.applicants) {
            for (var app in vm.applicants[i].favs) {
              if ($rootScope.user._id === vm.applicants[i].favs[app].userID && $scope.roleData._id === vm.applicants[i].favs[app].roleID) {
                vm.applicants[i].favorited = vm.applicants[i].favs[app].favorited;
              }
            }

            if (vm.applicants[i].suppliments.length > 0) {
              for (var j in vm.applicants[i].suppliments) {
                //check for headshot labeling
                if (angular.equals(vm.applicants[i].suppliments[j].name, "Headshot") ||
                  angular.equals(vm.applicants[i].suppliments[j].name, "headshot")) { //check it attachment is an image
                  if (vm.applicants[i].suppliments[j].file_type.indexOf('image') != -1) {
                    /*console.log(vm.applicants[i].suppliments[j].file_type);*/
                    vm.applicants[i].headshot = vm.applicants[i].suppliments[j].source;
                    break;
                  }
                  vm.applicants[i].headshot = "/assets/imgs/img_headshot_placeholder.png";
                } else if (vm.applicants[i].suppliments[j].file_type.indexOf("image") != -1) {
                  /*console.log(vm.applicants[i].suppliments[j]);*/
                  vm.applicants[i].headshot = vm.applicants[i].suppliments[j].source;
                }
                //if no headshot is attached
                else vm.applicants[i].headshot = "/assets/imgs/img_headshot_placeholder.png";
              }
            }
            // no attachment
            else vm.applicants[i].headshot = "/assets/imgs/img_headshot_placeholder.png";
          }
        })
        .error(function(error) {
          console.log(error);
        })
    }

    /*vm.gridStyle = {'opacity': 1};*/

    vm.getProject = function(prjID) {
      $location.path('/projectDetails/' + prjID);
    }
    vm.setGridVw = function() {
      vm.listStyle = {
        'opacity': 0.2
      };
      vm.gridStyle = {
        'opacity': 1
      };
      vm.listView = false;
      vm.gridView = true;
    }
    vm.setListVw = function() {
      vm.listStyle = {
        'opacity': 1
      };
      vm.gridStyle = {
        'opacity': 0.2
      };
      vm.gridView = false;
      vm.listView = true;
    }

    vm.backBtn = function() {
      $scope.viewApp = false;
      $scope.$emit("showNav");
      if ($scope.currApp.new) {
        Applicant.viewedUpdate($scope.currApp._id);
        $route.reload();
      }
    }

    var updateCarosel = function(index) {
      $scope.carouselIndex = 0;
      $scope.slides = [];
      $scope.currIndex = index;
      $scope.currApp = vm.applicants[index];
      addSlides($scope.slides, $scope.currApp.suppliments);
    }

    vm.viewBtn = function(index) {
      $scope.$emit("hideNav");
      updateCarosel(index);
      $scope.viewApp = true;
    }
    vm.nextApp = function() {
      if ($scope.currIndex < vm.applicants.length - 1) {
        $scope.currIndex += 1;
        /*vm.viewBtn($scope.currIndex)*/
        updateCarosel($scope.currIndex);
      } else {
        $scope.currIndex = 0;
        updateCarosel($scope.currIndex);
      }
    }
    vm.lastApp = function() {
      console.log($scope.currIndex)
      if ($scope.currIndex <= 0) {
        $scope.currIndex = vm.applicants.length - 1;
        /*vm.viewBtn($scope.currIndex)*/
        updateCarosel($scope.currIndex)
      } else {
        $scope.currIndex -= 1;
        updateCarosel($scope.currIndex);
      }
    }
    vm.updateFav = function(aplnt, roleID) {
      aplnt.favorited = !aplnt.favorited;
      Applicant.favUpdate(aplnt, roleID);

    }

    $scope.deleteAppBtn = function() {
      Applicant.delete($scope.currApp._id, $scope.roleData._id)
        .success(function() {
          getApps();
          if ($scope.viewApp === true) {
            /*            $scope.$emit("showNav");
             */
            vm.lastApp();
            /*$scope.viewApp = false;*/
          }
          deleteAppAside.hide();
        })
        .error(function(err) {
          console.log(err);
        })
    }

    $scope.goToLink = function(url) {
      var tmp = url.spli
      if (url.indexOf('http') != -1) {
        $window.open(url);
      } else {
        $window.open("http://" + url);
      }
    }

    function addSlide(target, data) {
      var i = target.length;
      var fileTypes = ["video", "image", "applicantion/pdf", "link"];

      for (item in fileTypes) {
        if (data.file_type.indexOf(fileTypes[item])) {
          fileTypes[item] = false;
        } else {
          fileTypes[item] = true;
        }
      }
      target.push({
        id: (i + 1),
        label: data.name,
        source: data.source,
        video: fileTypes[0],
        image: fileTypes[1],
        document: fileTypes[2],
        link: fileTypes[3],
        odd: (i % 2 === 0)
      });
    };
    $scope.carouselIndex = 0;

    function addSlides(target, sourceArr) {
      var _knwnFtypes = ["jpeg", "pdf", "img"]
      $scope.video = [], $scope.images = [],
        $scope.documents = [], $scope.links = [];

      for (var i = 0; i < sourceArr.length; i++) {
        var fType = sourceArr[i].file_type;
        if (fType == "Link") {
          $scope.links.push(sourceArr[i]);
          /*addSlide(target, sourceArr[i]);*/
        }
        if (fType.indexOf('video') != -1) {
          $scope.video.push(sourceArr[i]);

          addSlide(target, sourceArr[i]); //carousel
        } else if (fType.indexOf('image') != -1) {

          $scope.images.push(sourceArr[i]);
          addSlide(target, sourceArr[i]); //carousel
        } else if (fType == "application/pdf" ||
          fType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          $scope.documents.push(sourceArr[i]);
          /*addSlide(target, sourceArr[i]);*/
        }
      }
    }

    //delete aside btn  
    vm.deleteAsideBtn = function(app) {
      $scope.currApp = app
      deleteAppAside.$promise.then(deleteAppAside.toggle);
    }
    vm.deleteRoleBtn = function() {
      /*$scope.roleData = data;*/
      deleteRoleAside.$promise.then(deleteRoleAside.toggle);
    }
    vm.deleteRoleBtn = function() {
      /*$scope.roleData = data;*/
      deleteRoleAside.$promise.then(deleteRoleAside.toggle);
    }
    vm.shareBtn = function() {
      shareRoleAside.$promise.then(shareRoleAside.toggle);
    }
    vm.editRoleBtn = function() {
      editRoleAside.$promise.then(editRoleAside.toggle);
    }

  })

.controller('CommentBoxCtrl',
  function($scope, Applicant) {
    var vm = this;
    vm.newComment;

    vm.deleteCmt = function(appID, index, comment) {
      Applicant.deleteComment(appID, comment);
      delete $scope.currApp.comments[index];
    }
    vm.addCmt = function(appID, owner, comment) {
      var cmt = {
        owner: owner,
        comment: comment
      }

      $scope.currApp.comments.push(cmt);
      Applicant.pushComment(appID, cmt);
      vm.newComment = "";
    }
  })