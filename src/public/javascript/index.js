
(function() {
const user= User.User
var profile;
class FetchPlaylists extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      next:''

    };
  }


  componentDidMount() {
    var  options={
      headers: {
        'Authorization': 'Bearer ' + access_token
      }};

        fetch('https://api.spotify.com/v1/me',
            options)
          .then(res => res.json())
          .then(
            (result) => {
              this.setState({})
              profile.href=result.href;


    this.state.next=profile.href+'/playlists';
    const getPlaylists=async _ =>{
        //get all playlists in a users library
    while (this.state.next!=null){

     try{
     const res= await fetch(this.state.next,options);
     const data=await res.json();


          this.setState({
            isLoaded: true,
            items: this.state.items.concat(data.items),
            next:data.next
          });

     }
     catch(err){
         alert(err.message);
         $("#root").hide();
         $("#home").show();
         return;
     }





  }
};
      getPlaylists();
      });

  }

  getTracks(id,total){
      let res='';
      if (id=="Liked"){
         res= profile.libraryAudioFeatures('https://api.spotify.com/v1/me/tracks?offset=0&limit=50',id);
      }
      else{ res= profile.libraryAudioFeatures('https://api.spotify.com/v1/playlists/'+id+'/tracks',id);

      }


      $('#'+id).children('h3').text('Loading playlist...');
      res.then((data)=>{
         $('#root').hide();
         $('#sorting-features').show();
         window.scrollTo(0,0);
     }
     )

    }

  render() {
      //render divs with playlist image and title
    const { error, isLoaded, items } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      var imgurls=[]
      //verify images of proper size exist
      for(var i=0;i<items.length;i++){
      if(items[i].images.length==0){imgurls.push('blankplaylist.png')}
      else if (items[i].images.length>1){imgurls.push(items[i].images[1].url);}
      else{




        if(items[i].images[0].height>300 && items[i].images[0].width>300){
          imgurls.push('blankplaylist.png');
        }
        else{imgurls.push(items[i].images[0].url);}
      }
    }
      return (
        <div>

          <div className="stepdiv">
          <h1 id="header-3"> Select playlist or your liked songs to use as a base</h1>
        </div>


      <div className="row">

        <div className="column" ><div className="content"  id="Liked" onClick={() => this.getTracks("Liked",0)}><img id='plimg'
         src='Liked.png'></img>
        <h3>Liked Songs</h3></div></div>

          {items.map((item,index) => (

            <div className="column" ><div className="content" onClick={() => this.getTracks(item.id,item.tracks.total)} id={item.id}>
             <img id='plimg' src={imgurls[index]}></img>
              <h3>{item.name}</h3>
            </div>
          </div>
        ))}
        </div>

      </div>
      );
    }
  }
}

//create audio feature sliders
$.extend( $.ui.slider.prototype.options, {
    animate: 300
});
let afArr=['energy','valence','danceability','acousticness','loudness','instrumentalness'
,'liveness','speechiness','tempo'];

afArr.forEach((item)=>{

if (item=='loudness' ){
  $("#"+item+"-slider")
      .slider({
          max: 0,
          min: -60,
          step:1,
          range: true,
          values: [-60, 0]
      });

    }
    else if(item=='tempo'){
      $("#"+item+"-slider")
          .slider({
              max: 250,
              min: 0,
              step:2,
              range: true,
              values: [0,250]
          });
    }

    else{
      $("#"+item+"-slider")
          .slider({
              max: 1,
              min: 0,
              step:0.01,
              range: true,
              values: [0, 1]
          });
    }

      $("#"+item+"-slider").slider({
          stop: function(event, ui) {

            var min = $("#"+item+"-slider").slider("option", "min");
              var max = $("#"+item+"-slider").slider("option", "max");
              profile.range[item]=ui.values;
              console.log(ui.values);
              if (ui.values==[0,1]){delete profile.range[item];}
                //update included tracks based on changes in slider values
                profile.slidersChanged=true;
                profile.trackOptions();

                var length=JSON.stringify(profile.idList.length);
                var modLength=JSON.stringify(profile.idListMod.length);
                if (modLength==length){$('#length').text('All tracks match these criteria.');}
                else{
                $('#length').text(modLength+' out of '+length+' tracks match these criteria.');
              }
              }
            });

      });
      $.extend( $.ui.slider.prototype.options, {
          animate: 300
          });

document.getElementById('make-playlist').addEventListener('click', function() {

    $("#make-playlist,#p-error").hide();
    $("#loading").show();
    //get name and type of playlist from form
    const name =document.getElementById("name").value.toString();
    const type = document.getElementById("ptype");
    if (name.length===0){
        $("#p-error,#make-playlist").show();
        $("#loading").hide();
        return;

    }
    const text = type.options[type.selectedIndex].text;

    let typeBool="true";
    if (text=="Private"){
      typeBool="false"
    }
    //create request arguments
    let headers = {
      'Authorization': 'Bearer '+profile.access_token,
      'Content-Type': 'application/json'
      };


   let dataString= `{\"name\":\"${name}\", \"public\":${typeBool}}`

    let options = {
      method:'POST',
      headers: headers,
      body: dataString
  };

    const res=profile.makePlaylist(options)
    res.then((data)=>{
       //show link to new playlist on success
        $("#step3").hide();
        document.getElementById("successtext").addEventListener('click', function() {
          open(data[1]);
        });

        $("#success").show();
    })
    .catch((err)=>{
        alert(err);
        $("#step3").hide();
        $("#home").show();
    })


});
document.getElementById('next2').addEventListener('click', function() {
    //show final page on button click
$("#sorting-features").hide();
$("#step3").show();
//create playlist if sliders havent been changed
if (profile.idListMod.length==0 && !profile.slidersChanged){profile.idListMod=profile.idList}



});
document.getElementById('aboutnav').addEventListener('click', function() {
    $("#home,#root,step3,#sorting-features").hide();

    $("#about").show();
});

function getHashParams() {
    //generates access token
 var hashParams = {};
 var e, r = /([^&;=]+)=?([^&;]*)/g,
     q = window.location.hash.substring(1);
 while ( e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
 }
 return hashParams;
}

var params = getHashParams();

var access_token = params.access_token,
   refresh_token = params.refresh_token,
   error = params.error,

   username='';
   if (error) {
     alert('There was an error during the authentication, please try again');
     $("#home").show();
   }

else if (access_token){
    //generate user object when access token is created from login
  profile= new user(access_token)
  ReactDOM.render(
    <FetchPlaylists />,
    document.getElementById('root')
  );



  }
  else{

    $("#home").show();

  }

}());
