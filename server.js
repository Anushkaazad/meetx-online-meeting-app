const express = require("express");
const path = require("path");
var app = express();
var server = app.listen(3000, function () {
    console.log("Listening on port 3000");
});
const fs = require("fs");
const io = require("socket.io")(server, {
    allowEIO3: true, // false by default
});
app.use(express.static(path.join(__dirname, "")));
var userConnections = [];
io.on("connection", (socket) => {
  console.log("socket id is ", socket.id);
  socket.on("userconnect", (data) => {
    console.log("userconnent", data.displayName, data.meetingid);
        var other_users = userConnections.filter(
            (p) => p.meeting_id == data.meetingid
        );
        userConnections.push({
            connectionId: socket.id,
            user_id: data.displayName,
            meeting_id: data.meetingid,
        });
        var userCount = userConnections.length;
        console.log(userCount);

        other_users.forEach((v) => {

            socket.to(v.connectionId).emit("inform_others_about_me", {

              other_user_id: data.displayName,
              
              connId: socket.id,  
              userNumber: userCount,
            });
        });
        socket.emit("inform_me_about_other_user", other_users);
    });
    socket.on("SDPProcess", (data) => {
        socket.to(data.to_connid).emit("SDPProcess", {
            message: data.message,
            from_connid: socket.id,
        });
    });


    socket.on("disconnect",function(){
        console.log(" Disconnected");
       var disUser =  userConnections.find((p)=> p.connectionId == socket.id);
       if(disUser){
           var meetingid = disUser.meeting_id;
           userConnections = userConnections.filter((p)=>p.connectionId != socket.id);

           var list = userConnections.filter((p)=>p.meeting_id == meetingId)
           list,forEach((v)=>{
               socket.to(v.connectionId).emit("inform_about_connection_end",{
                   connId:socket.id, 
               });
           });
       }
    })
});