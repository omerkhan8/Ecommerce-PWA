const auth = firebase.auth();
const db = firebase.database();
const messaging = firebase.messaging();


// registering the service worker...

if ('serviceWorker' in navigator) {

    console.log('Service Worker is supported');

    // if service worker supported then register my service worker
    navigator.serviceWorker.register('firebase-messaging-sw.js').then(function (reg) {
        console.log('Successfully Register :^)');

        reg.pushManager.subscribe({
            userVisibleOnly: true
        }).then(function (subscription) {
            // console.log('subscription:', subscription.toJSON());
            // GCM were used this endpoint
            // console.log('endpoint:', subscription.endpoint);
        });
    })
        .catch((e) => {
            console.log('service worker failed', e);
        })
}




// state chage 

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        document.getElementById('myButtons').setAttribute('style', 'display:none');
        document.getElementById('userPanel').removeAttribute('style');
        document.getElementById('createButton').removeAttribute('disabled');

        setTimeout(() => {
            messaging.requestPermission().then(function () {
                console.log('Notification permission granted.');
                return messaging.getToken();
            }).then(function (token) {
                // Displaying user token
                console.log('token >>>> ', token);
                db.ref().child(`Tokens/${auth.currentUser.uid}/`).set(token);
            }).catch(function (err) { // Happen if user deney permission
                console.log('Unable to get permission to notify.', err);
                alert('your notifications are blocked');
            });

        }, 3000)
    }
    else {
        document.getElementById('createButton').setAttribute('disabled', 'disabled');
    }
})

// login

function login() {
    var email = document.getElementById("email");
    var password = document.getElementById("password");
    if (email.value == '') {
        swal({
            title: "Please Enter your Email",
            // text: "You clicked the button!",
            icon: "warning",
        });
        email.focus();
    }
    else if (password.value == '') {
        swal({
            title: "Please Enter your Password",
            // text: "You clicked the button!",
            icon: "warning",
        });
        password.focus();
    }

    else {
        auth.signInWithEmailAndPassword(email.value, password.value)
            .then((s) => {
                swal({
                    title: "Successfully logged in",
                    // text: "You clicked the button!",
                    icon: "success",
                });

                setTimeout(() => {
                    // location.reload();
                    location.href = 'index.html';
                }, 1000)

            })
            .catch((err) => {
                console.log(err)
                swal({
                    title: "Invalid Username/Password Entered",
                    // text: "You clicked the button!",
                    icon: "error",
                });
            })
    }

}

// create account

function signup() {
    var userName = document.getElementById("userName");
    var userEmail = document.getElementById("userEmail");
    var userPassword = document.getElementById("userPassword");
    var emailCheck = userEmail.value;

    if (!emailCheck.match(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/)) {
        swal({
            title: "Please Enter a valid email adress",
            // text: "You clicked the button!",
            icon: "warning",
        });
        userEmail.focus();
    }

    else if (userName.value === '') {
        swal({
            title: "Please Enter your Username",
            // text: "You clicked the button!",
            icon: "warning",
        });
        userName.focus();

    }
    else if (userPassword.value === '') {
        swal({
            title: "Please Enter your Password",
            // text: "You clicked the button!",
            icon: "warning",
        });
        userPassword.focus();
    }

    else if (userPassword.value.length <= 6) {
        swal({
            title: "Password should be more than 6 characters",
            // text: "You clicked the button!",
            icon: "warning",
        });
    }

    else {
        auth.createUserWithEmailAndPassword(userEmail.value, userPassword.value)
            .then((result) => {
                let userData = {
                    username: userName.value,
                    email: userEmail.value,
                    password: userPassword.value,
                    uid: result.user.uid
                }
                db.ref().child(`user/${userData.uid}`).set(userData).then(() => {
                    userName.value = '';
                    userEmail.value = '';
                    userPassword.value = '';
                    swal({
                        title: "Account Created",
                        // text: "You clicked the button!",
                        icon: "success",
                    });
                    setTimeout(() => {
                        // location.reload();
                        location.href = 'index.html';
                    }, 1000)

                })

            })
            .catch((err) => {
                console.log(err)
                swal({
                    title: "Unable to login please try again",
                    // text: "You clicked the button!",
                    icon: "error",
                });
            })
    }

}

// logout

function signoutUser() {
    auth.signOut()
        .then((success) => {
            document.getElementById('myButtons').removeAttribute('style');
            document.getElementById('userPanel').setAttribute('style', 'display:none');
            location.href = "index.html";
        })
}

// function for upload image

function uploadImage() {
    var storageRef = firebase.storage().ref();
    var imagesRef = storageRef.child('images/ads_' + Math.random().toString().substring(2, 6) + '.jpg');
    var file = document.getElementById('cFile').files[0] // use the Blob or File API
    if (file == undefined) {
        swal({
            title: "Please Upload a valid image",
            // text: "You clicked the button!",
            icon: "error",
        });
        document.getElementById('adLoaderMain').setAttribute('style', 'display:none');
        document.getElementById('adLoader').removeAttribute('style');
        document.getElementById('cName').value = '';
        document.getElementById('cDescription').value = '';
        document.getElementById('cModel').value = '';
        document.getElementById('cPrice').value = '';
        document.getElementById('inputState').selectedIndex = 0;
    }
    else {
        return new Promise((resolve, reject) => {
            imagesRef.put(file)
                .then(function (snapshot) {
                    console.log('Uploaded a blob or file!', snapshot);
                    imagesRef.getDownloadURL().then(function (url) {
                        // console.log('URL ***', url)
                        resolve(url);
                    }).catch(function (error) {
                        // Handle any errors
                        swal({
                            title: "Please upload a valid image!",
                            // text: "You clicked the button!",
                            icon: "error",
                        });
                    });
                }).catch(() => {
                    swal({
                        title: "Please upload a valid image!",
                        // text: "You clicked the button!",
                        icon: "error",
                    });
                });
        })
    }
}

// to post an ad

function postAd() {

    let category = document.getElementById('inputState').value;
    let cName = document.getElementById('cName').value;
    let cDesc = document.getElementById('cDescription').value;
    let cTitle = document.getElementById('cModel').value;
    let cPrice = document.getElementById('cPrice').value;

    if (category == "Category" || cName == '' || cDesc == '' || cTitle == '' || cPrice == '') {
        swal({
            title: "Invalid Fields Please try again",
            // text: "You clicked the button!",
            icon: "warning",
        });
    }

    else if (auth.currentUser == null) {
        swal({
            title: "You must logged in to submit the Ad!",
            // text: "You clicked the button!",
            icon: "warning",
        });
    }

    else {
        document.getElementById('adLoaderMain').removeAttribute('style');
        document.getElementById('adLoader').setAttribute('style', 'display:none');

        try {
            uploadImage()
                .then((url) => {

                    console.log('download URL', url)

                    let userID = auth.currentUser.uid;
                    let adObject = {
                        category, cName, cDesc, cTitle, cPrice,
                        url, userID
                    };
                    swal({
                        title: "Ad posted successfully",
                        // text: "You clicked the button!",
                        icon: "success",
                    });

                    db.ref('All').push(adObject).then((s) => {
                        db.ref().child(`Advertisement/${adObject.category}/Adkey${Math.random().toString().substring(2, 6)}`).set(s.key);
                        document.getElementById('cName').value = '';
                        document.getElementById('cDescription').value = '';
                        document.getElementById('cModel').value = '';
                        document.getElementById('cPrice').value = '';
                        document.getElementById('adLoaderMain').setAttribute('style', 'display:none');
                        document.getElementById('adLoader').removeAttribute('style');
                        setTimeout(() => {
                            location.href = "index.html";
                        }, 500)
                    })

                })
                .catch(() => {
                    document.getElementById('adLoaderMain').setAttribute('style', 'display:none');
                    document.getElementById('adLoader').removeAttribute('style');
                    swal({
                        title: "Some error occupied please try again",
                        icon: "error",
                    });
                })
        }
        catch (e) {
            console.log(e)
            document.getElementById('adLoaderMain').setAttribute('style', 'display:none');
            document.getElementById('adLoader').removeAttribute('style');
        };
    }
}

// display ad on dom on index.html
// calls in body onload

function showAllAds() {
    let userArray = [];

    db.ref().child(`All/`).once('value').then((snapshot) => {
        console.log('data', snapshot.val());
        let data = snapshot.val();

        for (let key in data) {
            data[key].adKey = key;
            userArray.push(data[key]);
        }

        localStorage.setItem('adArray', JSON.stringify(userArray));
        console.log('array', userArray)

        document.getElementById('addCharts').innerHTML += userArray.map((val, indx) => {

            return `<div class="card card_style" id="${indx}"  style="width: 18rem;">
      <img class="card-img-top card_img" src="${val.url}" alt="image" style="background-color:white;">
      <div class="card-body">
        <h5 class="card-title">${val.cTitle}</h5>
        <p class="card-text"><b>Description:</b> ${val.cDesc}</p>
        <p class="card-text"><span style="color:orangered; font-size:1.2em;"><b>Price:</b></span> ${val.cPrice}/-</p>
        <a href="javascript:void(0);" onclick ="chat('${val.adKey}')" class="btn btn-primary">Message</a>
        <span class="myHeart" data-toggle="tooltip" data-placement="right" title="Add to favourite">
        <i class="fa fa-heart heart" id="${val.adKey}" onclick="addToFav('${val.adKey}')"></i>
        </span>
      </div>
      <p class="card-text adsubmitby">Ad posted by: <b>${val.cName}</b></p> 
    </div>`

        }).join('');

        if (auth.currentUser == null) {
            console.log('user not login');
        }
        else {
            db.ref().child(`favourites/${auth.currentUser.uid}/`).once('value').then((snapshot) => {
                let myData = snapshot.val();
                if (myData == null) {
                    console.log('nothing in fav');
                }
                else {
                    let myDataArr = Object.keys(myData);
                    for (let myArr of myDataArr) {
                        let ki = myArr;
                        document.getElementById(ki).style.color = 'red';
                    }
                }
            })
        }
    })

        .catch((rej) => {
            console.log('error', rej);

        })
}

// to click the heart and it becomes red

function addToFav(adv) {
    if (auth.currentUser == null) {
        swal({
            title: "You must logged in to add to favourite!",
            icon: "warning",
        });
    }

    else {

        if (document.getElementById(adv).getAttribute('style') == 'color: red;') {

            db.ref().child(`favourites/${auth.currentUser.uid}/${adv}`).remove().then(() => {
                document.getElementById(adv).removeAttribute('style');
                location.reload();
            })

        }
        else {
            document.getElementById(adv).style.color = 'red';
            db.ref().child(`favourites/${auth.currentUser.uid}/${adv}`).set(Math.random().toString().substring(2, 6));
        }
    }
}

// to get the current user uid

function getCurrentUser() {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                resolve(user.uid);
            }
            else {
                reject('not logged in!');
            }

        })
    });
}

// displays on dom on favourite page.

function favouritePage() {

    getCurrentUser().then(currUserId => {

        db.ref().child(`favourites/${currUserId}`).once('value').then(snapshot => {
            let data = snapshot.val();
            if (data == null) {
                document.getElementById('addChartsFav').innerHTML = `<div class="alert alert-danger" role="alert">
                No Ads in favourites. <a href="index.html" class="alert-link">Click to go back to Home page</a>. 
              </div>`
                let a = [];
                localStorage.setItem('adArrayFav', JSON.stringify(a));
            }
            else {
                let dataArr = Object.keys(data)
                localStorage.setItem('adArrayFav', JSON.stringify(dataArr));
                let i = 0;
                for (let arr of dataArr) {
                    db.ref().child(`All/${arr}`).once(`value`).then(snap => {
                        let val = snap.val();

                        document.getElementById('addChartsFav').innerHTML += `<div class="card card_style" id="${i}"  style="width: 18rem;">
                        <img class="card-img-top card_img" src="${val.url}" alt="image" style="background-color:white;">
                        <div class="card-body">
                          <h5 class="card-title">${val.cTitle}</h5>
                          <p class="card-text"><b>Description:</b> ${val.cDesc}</p>
                          <p class="card-text"><span style="color:orangered; font-size:1.2em;"><b>Price:</b></span> ${val.cPrice}/-</p>
                          <a href="javascript:void(0);" class="btn btn-primary">Go somewhere</a>
                          <span class="myHeart" data-toggle="tooltip" data-placement="right" title="Add to favourite">
                          <i class="fa fa-heart heart" id="${arr}" onclick="addToFav('${arr}')"></i>
                          </span>
                        </div>
                        <p class="card-text adsubmitby">Ad posted by: <b>${val.cName}</b></p> 
                      </div>`;

                        document.getElementById(arr).style.color = 'red';
                        i++;
                    })
                }
            }
        })

    })
        .catch(rej => {
            console.log(rej);
            swal({
                title: "Please login first",
                icon: "warning",
            });
            setTimeout(() => {
                location.href = 'index.html';
            }, 1000)

        })
}

// search ads

function search(arr) {
    let searchBar = document.getElementById('searchBar');
    let filter = searchBar.value.toUpperCase();
    // let arr = JSON.parse(localStorage.getItem('adArray'));
    let temp = 0;
    if (arr.length > 0) {
        for (let i = 0; i != arr.length; i++) {
            let firstDiv = document.getElementById(i);
            let title = firstDiv.getElementsByTagName('h5')[0];
            if (title) {
                if (title.innerHTML.toUpperCase().indexOf(filter) > -1) {
                    firstDiv.style.display = '';
                    if (document.getElementById('headingTitle')) {
                        document.getElementById('headingTitle').innerHTML = 'All Ads';
                        document.getElementById('categorySelect').selectedIndex = 0;
                    }
                    document.getElementById('foundNoAds').style.display = 'none';
                }
                else {
                    firstDiv.style.display = 'none';
                    temp++;
                    if (temp == arr.length) {
                        document.getElementById('foundNoAds').style.display = '';
                        document.getElementById('foundNoAds').innerHTML = `<div class="alert alert-danger" role="alert">
                    No Results found for <strong> ${searchBar.value} </strong>  
                  </div>`
                    }
                }
            }

        }
    }
}

// searching ads by categories

function searchCategory(val) {
    let select = document.getElementById('categorySelect');
    if (val == 'All Ads') {
        document.getElementById('headingTitle').innerHTML = val;
    }
    else {
        document.getElementById('headingTitle').innerHTML = `Category | ${val}`;
    }
    let arr = JSON.parse(localStorage.getItem('adArray'));
    let temp = 0;
    if (arr.length > 0) {
        for (let i = 0; i != arr.length; i++) {

            let getDiv = document.getElementById(i);
            if (arr[i].category == val) {
                getDiv.style.display = '';
                document.getElementById('foundNoAds').style.display = 'none';
            }
            else if (val == 'All Ads') {
                getDiv.style.display = '';
                document.getElementById('foundNoAds').style.display = 'none';
            }
            else {
                getDiv.style.display = 'none';
                temp++;
                if (temp == arr.length) {
                    document.getElementById('foundNoAds').style.display = '';
                    document.getElementById('foundNoAds').innerHTML = `<div class="alert alert-danger" role="alert">
                    Currently no Ads posted in <strong> ${val} </strong>  
                  </div>`
                }
            }
        }
    }
}

// messages page on load function

function message() {
    if (screen.width <= 650) {
        let hide1 = document.getElementById('hideMe');
        hide1.style.display = 'none';
        document.getElementsByClassName('tabcontent')[0].style.width = '100%';
        document.getElementById('backIcon').style.display = 'inline';
        document.getElementsByClassName('tab')[0].style.width = '100%';
        document.getElementById('chatInputText').setAttribute('style', 'width:100%;');
        document.getElementsByClassName('tab')[0].style.height = `${screen.height - 120}px`;
        document.getElementsByClassName('tabcontent')[0].style.height = `${screen.height - 120}px`;
    }

    getCurrentUser().then(uid => {

        var mql = window.matchMedia('(max-width: 650px)');
        mql.addListener((c) => {
            let hide = document.getElementById('hideMe');

            if (c.matches) {
                hide.style.display = 'none';
                // hide.style.width = '100%';
                document.getElementsByClassName('tabcontent')[0].style.width = '100%';
                document.getElementById('backIcon').style.display = 'inline';
                document.getElementsByClassName('tab')[0].style.width = '100%';
                document.getElementById('chatInputText').setAttribute('style', 'width:100%;');
            }
            else {
                hide.removeAttribute('style');
                document.getElementById('backIcon').removeAttribute('style');
                document.getElementsByClassName('tab')[0].removeAttribute('style');
                document.getElementsByClassName('tab')[0].style.height = `${screen.height - 230}px`;
                document.getElementsByClassName('tabcontent')[0].removeAttribute('style');
                document.getElementsByClassName('tabcontent')[0].style.height = `${screen.height - 230}px`;
                document.getElementById('chatInputText').removeAttribute('style');
            }
        })

        if (screen.width > 650) {
            document.getElementsByClassName('tab')[0].style.height = `${screen.height - 230}px`;
            document.getElementsByClassName('tabcontent')[0].style.height = `${screen.height - 230}px`;
        }

        db.ref().child(`chatRoom/${uid}/`).once('value').then((snapshot) => {
            let data = snapshot.val();
            if (data == null) {
                document.getElementsByClassName('tab')[0].innerHTML += `<div class="alert alert-danger" role="alert">
                <b>Currently no Chats in inbox.</b>  
              </div>`;
            }
            else {
                let arrVal = Object.values(data);
                for (val of arrVal) {
                    let info = val.info;
                    // console.log(info);
                    document.getElementsByClassName('tab')[0].innerHTML +=
                        `<div class="tabChats" onclick="getMessages(event , '${info.reciverId}');">
                            <img src="${info.url}" style="float:left"></img>
                         <div class = "chatList">
                            <p>${info.cName} <br> <span style="color:#92B12A;">Ad: ${info.cTitle} </span></p>
                         </div>
                    </div>`
                }
            }
        })

    })

        .catch(() => {
            swal({
                title: "Please login first",
                icon: "warning",
            });
            setTimeout(() => {
                location.href = 'index.html';
            }, 1000)
        })
}

// messege button click function

function chat(val) {
    if (auth.currentUser == null) {
        swal({
            title: "Please login to send a message",
            icon: "warning",
        });
    }
    else {
        let userArray = JSON.parse(localStorage.getItem('adArray'));
        let adUser;

        for (let key in userArray) {
            if (userArray[key].adKey == val) {
                adUser = userArray[key]
            }
        }

        if (adUser.userID == auth.currentUser.uid) {
            swal({
                title: "You've Posted this Ad, can not message yourself.",
                icon: "warning",
            });
        }
        else {
            let { adKey, cName, cTitle, userID, url } = adUser;
            let infoObj = {
                adKey, cName, cTitle, url,
                reciverId: userID,
                senderID: auth.currentUser.uid
            };

            db.ref().child(`chatRoom/${auth.currentUser.uid}/${adUser.userID}/info`).set(infoObj)
                .then(() => {
                    db.ref(`user/${auth.currentUser.uid}`).once('value').then((snap) => {

                        let infoObj2 = {
                            adKey,
                            cTitle, url,
                            reciverId: auth.currentUser.uid,
                            senderID: userID,
                            cName: snap.val().username
                        };
                        db.ref().child(`chatRoom/${adUser.userID}/${auth.currentUser.uid}/info`).set(infoObj2)
                            .then(() => {
                                location.href = 'messages.html';
                            })

                    })

                })
        }
    }
}

// function on clicking the chats

function getMessages(event, info) {
    let btn = event.currentTarget;
    let divs = document.getElementsByClassName('tabChats');
    var objDiv = document.getElementsByClassName("tabcontent")[0];

    for (let i = 0; i < divs.length; i++) {
        divs[i].style.backgroundColor = '';
    }
    btn.style.backgroundColor = '#ccc';

    if (document.getElementById('hideMe').style.display == 'none') {
        document.getElementsByClassName('tab')[0].style.display = 'none';
        document.getElementById('hideMe').removeAttribute('style');

        document.getElementById('backIcon').addEventListener('click', () => {

            document.getElementById('hideMe').setAttribute('style', 'display:none');
            document.getElementsByClassName('tab')[0].style.display = '';
            for (let i = 0; i < divs.length; i++) {
                divs[i].style.backgroundColor = '';
            }
        })
    }
    showChatInput(info);
    document.getElementById('chatInput').focus();
    document.getElementById('chatMessages').innerHTML = '';

    if (btn.getAttribute('id') == null) {

        db.ref().child(`chatRoom/${auth.currentUser.uid}/${info}/messages`).on('child_added', function (s) {
            let data1 = s.val();
            if (data1.senderID == auth.currentUser.uid) {
                document.getElementById('chatMessages').innerHTML +=
                    `<div style="text-align: right">
                        <p class="textMsgs rightMsgs">
                            ${data1.msg}
                        </p>
                    </div>`;
                objDiv.scrollTop = objDiv.scrollHeight;
            }
            else {
                document.getElementById('chatMessages').innerHTML +=
                    `<div>
                        <p class="textMsgs">
                            ${data1.msg}
                        </p>
                    </div>`;
                objDiv.scrollTop = objDiv.scrollHeight;
            }

        })
    }

    else {
        db.ref().child(`chatRoom/${auth.currentUser.uid}/${info}/messages`).once('value').then((snap) => {
            let data = snap.val();
            if (data == null) {
                // no msgs in this chat
            }
            else {
                let dataArr = Object.values(data);
                for (let arr of dataArr) {
                    if (arr.senderID == auth.currentUser.uid) {

                        document.getElementById('chatMessages').innerHTML +=
                            `<div style="text-align: right">
                                <p class="textMsgs rightMsgs">
                                    ${arr.msg}
                                </p>
                            </div>`;
                        objDiv.scrollTop = objDiv.scrollHeight;
                    }
                    else {
                        document.getElementById('chatMessages').innerHTML +=
                            `<div>
                                <p class="textMsgs">
                                    ${arr.msg}
                                </p>
                            </div>`;
                        objDiv.scrollTop = objDiv.scrollHeight;
                    }
                }
            }
        })
    }

    btn.setAttribute('id', 'done');

}



function showChatInput(info) {
    document.getElementById('chatInputText').innerHTML = `<input type="text" class="form-control" placeholder="Send a message" aria-label="Send a message" aria-describedby="button-addon2" id="chatInput">
    <div class="input-group-append">
        <button class="btn btn-outline-secondary" type="button" id="button-addon2" onclick="sendMessage('${info}');">Send</button>
    </div>`;
}

// to send a message

function sendMessage(recId) {
    let msg = document.getElementById('chatInput').value;

    if (msg != '') {
        let msgDetails = {
            msg, senderID: auth.currentUser.uid, reciverId: recId
        };
        db.ref().child(`chatRoom/${auth.currentUser.uid}/${recId}/messages`).push(msgDetails)
        db.ref().child(`chatRoom/${recId}/${auth.currentUser.uid}/messages`).push(msgDetails)
        db.ref(`NotifityChat`).push(msgDetails)
            .then(() => {
                document.getElementById('chatInput').value = '';
            })
    }

}


messaging.onMessage(function (payload) {
    console.log('onMessage', payload);
});


