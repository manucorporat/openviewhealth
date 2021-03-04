// interface SessionEntry {
//   key: string;
//   content: string;
// }

// export const createSession = async (token: string, stream: MediaStream) => {
//   const peerConnection = new RTCPeerConnection(configuration);

//   const offer = await peerConnection.createOffer({
//     offerToReceiveAudio: true,
//     offerToReceiveVideo: true,
//   });
//   await peerConnection.setLocalDescription(offer);
//   const sessionID = await publishOffer(offer);
//   if (!sessionID) {
//     return;
//   }
//   peerConnection.onicecandidate = async (ev) => {
//     if (ev.candidate) {
//       console.log("got candidate");
//       await publish(sessionID, token, { candidate: ev.candidate });
//     }
//   };

//   peerConnection.ontrack = function (evt) {
//     console.log("onaddstream called", evt);
//   };

//   const stop = watchSession(sessionID, token, async (msg) => {
//     if (msg.answer) {
//       console.log("answer received");
//       await peerConnection.setRemoteDescription(msg.answer);
//       stream.getTracks().forEach((track) => {
//         peerConnection.addTrack(track, stream);
//       });
//     } else if (msg.candidate) {
//       try {
//         console.log("received candidate");
//         await peerConnection.addIceCandidate(msg.candidate);
//       } catch (e) {
//         console.error("Error adding received ice candidate", e);
//       }
//     }
//   });
//   const ready = new Promise<void>((resolve) => {
//     peerConnection.onconnectionstatechange = () => {
//       console.log(peerConnection.connectionState);
//       if (peerConnection.connectionState === "connected") {
//         stop();
//         resolve();
//       }
//     };
//   });
//   return {
//     peerConnection,
//     sessionID,
//     ready,
//   };
// };

// export const joinSession = async (
//   sessionID: string,
//   token: string,
//   stream: MediaStream
// ) => {
//   const peerConnection = new RTCPeerConnection(configuration);
//   peerConnection.onicecandidate = async (ev) => {
//     if (ev.candidate) {
//       console.log("got candidate");
//       await publish(sessionID, token, { candidate: ev.candidate });
//     }
//   };
//   peerConnection.ontrack = function (evt) {
//     console.log("onaddstream called", evt);
//   };

//   const stop = watchSession(sessionID, token, async (msg) => {
//     if (msg.offer) {
//       console.log("offer received");
//       peerConnection.setRemoteDescription(msg.offer);
//       stream.getTracks().forEach((track) => {
//         peerConnection.addTrack(track, stream);
//       });
//       const answer = await peerConnection.createAnswer();
//       await peerConnection.setLocalDescription(answer);
//       await publish(sessionID, token, { answer });
//     } else if (msg.candidate) {
//       try {
//         console.log("received candidate");
//         await peerConnection.addIceCandidate(msg.candidate);
//       } catch (e) {
//         console.error("Error adding received ice candidate", e);
//       }
//     }
//   });
//   return new Promise<RTCPeerConnection>((resolve) => {
//     peerConnection.onconnectionstatechange = () => {
//       console.log(peerConnection.connectionState);
//       if (peerConnection.connectionState === "connected") {
//         stop();
//         resolve();
//       }
//     };
//   });
// };

// const watchSession = (
//   sessionID: string,
//   token: string,
//   handler: (msg: any) => void
// ) => {
//   let lastSeen: string | undefined;
//   const intervalId = setInterval(async () => {
//     const posts = await readSession(sessionID, token, lastSeen);
//     if (posts && posts.length > 0) {
//       posts.forEach((post) => handler(JSON.parse(post.content)));
//       lastSeen = posts[posts.length - 1].key;
//     }
//   }, 5000);
//   return () => {
//     clearInterval(intervalId);
//   };
// };

// const readSession = async (
//   session: string,
//   token: string,
//   lastSeen: string | undefined
// ) => {
//   const params = new URLSearchParams({
//     token,
//     session,
//   });
//   if (lastSeen) {
//     params.append("last-seen", lastSeen);
//   }
//   const res = await fetch(`${HOST}/read-session?${params.toString()}`, {
//     method: "POST",
//   });
//   if (res.status === 200) {
//     const { posts } = await res.json();
//     return posts as SessionEntry[];
//   }
// };

// const publishOffer = async (
//   offer: RTCSessionDescriptionInit
// ): Promise<string | undefined> => {
//   const res = await fetch(`${HOST}/new-session?token=test`, {
//     method: "POST",
//     body: JSON.stringify({ offer }),
//   });
//   if (res.status === 200) {
//     const json = await res.json();
//     const id = json.id;
//     return id;
//   }
// };

// const publish = async (sessionId: string, token: string, content: any) => {
//   await fetch(`${HOST}/post-session?token=${token}&session=${sessionId}`, {
//     method: "POST",
//     body: JSON.stringify(content),
//   });
// };

// const configuration = {
//   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
// };
