import Head from "next/head";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

const APP_ID = process.env.FB_APP_ID;
const PAGE_ID = "341274443699478";
export default function Home() {
    const [pageData, setPageData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [comments, setComments] = useState([]);
    const [magicWord, setMagicWord] = useState("");
    const [hasSaidMagicWord, setHasSaidMagicWord] = useState(false);
    useEffect(() => {
        window.fbAsyncInit = function () {
            FB.init({
                appId: "3792367554161223",
                autoLogAppEvents: true,
                xfbml: true,
                version: "v9.0",
            });
        };
    }, []);
    function getLiveVideoStream() {
        var source = new EventSource(
            `https://streaming-graph.facebook.com/121985316467925/live_comments?access_token=${pageData.access_token}&comment_rate=one_per_two_seconds&fields=from{name,id},message`,
            {
                withCredentials: true,
            }
        );
        source.onmessage = function (event) {
            // Do something with event.message for example
            // console.log("event :>> ", event);
            const streamedComment = JSON.parse(event.data);
            isMagicWord(streamedComment.message);
            setComments((prev) => [...prev, streamedComment]);
        };
        console.log("source.withCredentials :>> ", source.withCredentials);
    }
    function handleClick() {
        FB.ui(
            {
                method: "share",
                href: "https://developers.facebook.com/docs/",
            },
            function (response) {}
        );
    }
    function login() {
        FB.login(
            function (response) {
                // handle the response
                console.log("response :>> ", response);
                setUserData(response);
            },
            {
                scope: "user_videos",
            }
        );
    }
    function logout() {
        FB.logout(function (response) {
            // user is now logged out
            console.log("LOGGED OUT :>> ");
        });
    }
    function getPageAccessToken() {
        FB.api(
            `/${userData.authResponse.userID}/accounts?
            fields=name,access_token&
            access_token=${userData.authResponse.accessToken}`,
            function (response) {
                console.log("response :>> ", response);
                setPageData(response.data[0]);
            }
        );
    }
    function getLoginStatus() {
        FB.getLoginStatus(function (response) {
            console.log("response :>> ", response);
            if (response.status === "connected") {
                // The user is logged in and has authenticated your
                // app, and response.authResponse supplies
                // the user's ID, a valid access token, a signed
                // request, and the time the access token
                // and signed request each expire.
                var uid = response.authResponse.userID;
                var accessToken = response.authResponse.accessToken;
            } else if (response.status === "not_authorized") {
                // The user hasn't authorized your application.  They
                // must click the Login button, or you must call FB.login
                // in response to a user gesture, to launch a login dialog.
            } else {
                // The user isn't logged in to Facebook. You can launch a
                // login dialog with a user gesture, but the user may have
                // to log in to Facebook before authorizing your application.
            }
        });
    }
    function isMagicWord(word) {
        const escapedMagicWord = magicWord.replace(
            /[-\/\\^$*+?.()|[\]{}]/g,
            "\\$&"
        );
        const regex = new RegExp(magicWord, "i");
        const isMatched = word.length !== 0 && regex.test(word);
        console.log("escapedMagicWord :>> ", escapedMagicWord);
        console.log("isMatched :>> ", isMatched);
        console.log("isMatched :>> ", regex.test(word));
        console.log("word :>> ", word);
        return isMatched;
    }
    return (
        <>
            <div className={styles.container}>
                <Head>
                    <title>Create Next App</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>

                <main className={styles.main}>
                    <h1 className={styles.title}>
                        Welcome to <a href="https://nextjs.org">Next.js!</a>
                    </h1>

                    <button onClick={handleClick}>Trigger Share</button>
                    <button onClick={getLoginStatus}>Get login Status</button>

                    <button onClick={login}>Login</button>
                    <button onClick={logout}>Logout</button>
                    <button onClick={getLiveVideoStream}>Get Stream</button>
                    <button onClick={getPageAccessToken}>Get page Data</button>
                    <div>
                        <div>
                            <input
                                type="text"
                                placeholder="magic word"
                                onBlur={(e) => setMagicWord(e.target.value)}
                                name=""
                                id=""
                            />
                            <div>{magicWord}</div>
                        </div>

                        <div>
                            {!hasSaidMagicWord
                                ? "magic word not said"
                                : "said magic word"}
                        </div>
                        {comments.length > 0 && (
                            <ul>
                                {comments.map((comment) => (
                                    <li key={comment.id}>
                                        <div>{comment.from.name}</div>
                                        <div>{comment.message}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </main>
            </div>
            <script
                defer
                crossOrigin="anonymous"
                src="https://connect.facebook.net/en_US/all.js"
            ></script>
        </>
    );
}
