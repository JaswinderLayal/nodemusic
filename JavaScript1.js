 <script>
var app = angular.module("adminMusicModule", ["angularFileUpload"]);
//app.run(function ($templateCache) {

//});
app.controller("MainController", function ($scope) {
    $scope.options = ["Add new Artist", "Add New Album", "Add New Song"];
    
    $scope.activeOption = $scope.options[0];
    $scope.change = function (index) {
        $scope.activeOption = $scope.options[index];
    }
    $scope.getScreen = function () {
        switch ($scope.activeOption) {
            case $scope.options[0]:
                return "../PartialViews/AddArtist.html";
                break;
            case $scope.options[1]:
                return "../PartialViews/Addalbum.html";
                break;
            case $scope.options[2]:
                return "../PartialViews/AddSong.html";
                break;
        }
    }
});
app.controller("AddAlbumCtrl", function ($scope, $http) {
    var imagepath = "images/artists/";
    
    $http.get('/admin/singers').success(function (data) {
        data.forEach(function (artist) {
            artist.singerImage = imagepath + artist.singerImage;
				
        });
        
        $scope.artists = data;
    });
    
    $scope.Album = null;
    $scope.AddingAlbum = function (artistobj) {
        console.log(artistobj);
        $scope.Album = artistobj;
    }
    
    $scope.AddAlbum = function () {
        var albumArray = $scope.Album.albums;
        $scope.Album.albums.push($scope.Album.new);
        delete $scope.Album.new;
        console.log($scope.Album);
        //$http.post("/admin/addAlbum", { data: $scope.Album }).success(function (data) {
        //});
        $upload.upload({
            url: 'server/upload/url', 
            data: $scope.Album,
            file: file,
        }).progress(function (evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        }).success(function (data, status, headers, config) {
            // file is uploaded successfully
            console.log(data);
        });
        console.log($scope.Album);

    }
});
    app.controller("AddTrackCtrl", function ($scope, $http, $upload) {
        $http.get('/admin/singers').success(function (data) {
            
            
            $scope.artists = data;
            console.log($scope.artists);
        });
        var file = null;
        $scope.onFileSelect = function ($files) {
            
            file = $files[0];
     
        }
        
        $scope.Albums = null;
        $scope.SongNo = 0;
        $scope.ShowAlbums = function (artist) {
            $scope.Albums = artist.albums;

        }
        $scope.Track = null;
        
        $scope.addSong = function () {
            $scope.Track.tracks.push({
                trackNumber: "",
                songTitle: "",
                trackLength: "",
                genre: ""
            });
        }
        $scope.AddTrack = function (album) {
            $scope.Track = album;
             
        }
        $scope.InsertSongs = function (Track) {
            var newTrack = angular.copy(Track)
            var tracks = newTrack.tracks;
            console.log(newTrack);
            
            $http.post("admin/addSongs", { data: newTrack }).success(function (data) {

            });
                
        }
    });
</script>

