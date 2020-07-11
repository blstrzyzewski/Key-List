User={
   User: function(access_token){
       //constructor function for user object
      this.href='';
      this.access_token=access_token;
      this.mainOptions={
        headers: { 'Authorization': 'Bearer ' + this.access_token },
          };
      this.idList=[];
      this.idListMod=[];
      this.sortedPlaylist=[];
      this.range={};
      this.playlistId='';
      this.playlistUrl='';
      this.uriList=[];
      this.outLink='';
      this.slidersChanged=false;
      this.getIDs=async function(url){

            const response= await fetch(url,this.mainOptions);
            const data = await response.json();

            return [data,data.next]
          };
       this.audioFeat=async function(ids){
           //get audio features of tracks given ids
           const response=await fetch('https://api.spotify.com/v1/audio-features/?ids='+ids,this.mainOptions);
           const data = await response.json();

         return data;
       }


      this.libraryAudioFeatures= async function(baseUrl,id){
            //generates audio features object for all tracks in a playlist
            let idArr =[];
            let afArr=[];
            let next='first'
            var values,total;
            let numLoaded=0;

            //get ids then get audiofeatures from those ids 
            do{
                 if (next=='first'){
                     values=await this.getIDs(baseUrl);
                     total=values[0].total;
                 }
                else{ values=await this.getIDs(next);}
                if(baseUrl.includes('playlist')){
                     values[0].items.forEach((item)=> {if (!item.is_local){idArr.push(item.track.id);}});
                 }
                else{values[0].items.forEach((item)=> {idArr.push(item.track.id);});}
                if (idArr.length!=50||values[1]==null){

                let result= await this.audioFeat(idArr);
                afArr=afArr.concat(result.audio_features);
                idArr=[];
                numLoaded+=100;
                if(total>500){$('#'+id).children('h3').text('Loading playlist... ('+numLoaded+' out of '+total+')');}

              }

                 next=values[1];


            }
            while(next!=null);
        this.idList=afArr;
        return afArr;

      }

this.trackOptions=function(){
  //remove tracks in playlist that dont fit audio feature values
  if (this.idList.length==0){return [];}
  this.idListMod=[];
  if(this.range==undefined){return this.idList;}
  var rangeArr=Object.keys(this.range);


  this.idList.forEach((track)=>{


    let count=0;
     for (let i=0;i<rangeArr.length;i++){
       let max=parseFloat(this.range[rangeArr[i]][1]);
       let min=parseFloat(this.range[rangeArr[i]][0]);
       let compNum=parseFloat(track[rangeArr[i]]);

       if (compNum<max && compNum>=min){
         count+=1;;
         }

     };
     if (count==rangeArr.length){this.idListMod.push(track);}

  });


}

this.sortPlaylist=function (){
  //sorts playlist by key and mode of tracks
   
  if (this.idListMod.length===0){return;}

  let index=0;
  this.uriList=[];
  this.sortedPlaylist=[];
  let iterlength=this.idListMod.length;
  //get first item of playlist
  this.sortedPlaylist[0]=this.idListMod[0];
  ele=this.idListMod.shift();
  this.uriList.push(ele.uri);
  let pitchShift=[0,7,-7,-5,5];
  for(let i=0;i<iterlength;i++){
      //try all compatible pitch shifts
      for(const pitch of pitchShift){

          index=this.sortedPlaylist.length-1;

          let keyFinder=(element) => element.key == this.sortedPlaylist[index].key+pitch && element.mode==this.sortedPlaylist[index].mode
          let foundIndex=this.idListMod.findIndex(keyFinder);

          if(foundIndex!==-1){
              //add uri of track to sorted playlist if compatible key is found
              let item=this.idListMod.splice(foundIndex,1);

              this.sortedPlaylist.push(item[0]);
              this.uriList.push(item[0].uri);
              break;

          }
          if (foundIndex==-1 && pitch==5){
              //if no compatible keys are found, add the first uri to playlist
              let item=this.idListMod.shift();
              if(item!==undefined){
              this.sortedPlaylist.push(item);
              this.uriList.push(item.uri);
             }
          }
      }

}





}
this.makePlaylist= function(options){
     //sort playlist
     this.sortPlaylist(this.idListMod);
     let playlistHref='';
     let outLink='';
     let href=this.href;
     let uriList=this.uriList;


     //calculate number of requests needed
     const iterCount=Math.ceil(this.uriList.length/100)
     async function createPlaylist(){
         //creates playlist for user given name and type in options
         //returns url and external link for playlist
         const res= await fetch(href+'/playlists',options)
         const dat=await res.json();
         return dat;
     }
          async function addTracks(){
            //add tracks from sorted playlist into newly created playlist

            const url=await createPlaylist();
            playlistHref=url.href;
            outLink=url.external_urls.spotify;
            if (uriList.length==0){
                return [playlistHref,outLink];
            }
            for(i=0;i<iterCount;i++){
              //create request argument with 100 track uris
              pidarg={}
              pidarg["uris"]=uriList.splice(0,100);

              pidarg=JSON.stringify(pidarg);
              options.body=pidarg;
           //add tracks to playlist
           const response=await  fetch(playlistHref+'/tracks',options);
           const data=await response.json();




     };
         return [url,outLink];
        }

        const url=  addTracks();

        return url;
}
}
}
