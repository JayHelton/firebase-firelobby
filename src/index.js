import 'bulma/css/bulma.css';

import firebase from 'firebase';
import React from 'react';
import { createRoot } from 'react-dom';
import {
  AuthCheck,
  FirebaseAppProvider,
  SuspenseWithPerf,
  useAuth,
  useFirestore,
  useFirestoreCollectionData,
  useUser,
} from 'reactfire';

const firebaseConfig = {};

function AuthenticationButtons() {
  const auth = useAuth();
  const signIn = async () => {
    await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  };
  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <AuthCheck
      fallback={
        <button className='button is-primary' onClick={signIn}>
          Sign In
        </button>
      }
    >
      <button className='button is-info' onClick={signOut}>
        Sign Out
      </button>
    </AuthCheck>
  );
}

function Navbar() {
  return (
    <nav className='navbar'>
      <div className='navbar-brand'>Fire Lobby 🔥</div>
      <div className='navbar-menu'>
        <div className='navbar-start'></div>
        <div className='navbar-end'>
          <div className='navbar-item'>
            <div className='buttons'>
              <AuthenticationButtons />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Lobby() {
  const { email, displayName, uid } = useUser();
  const lobbyCollection = useFirestore().collection('lobby');
  const lobby = useFirestoreCollectionData(lobbyCollection);

  const userInLobby = lobby.find(m => m.email === email);

  const joinLobby = async () => {
    await lobbyCollection.doc(uid).set({ email, displayName, ready: false });
  };

  const leaveLobby = async () => {
    await lobbyCollection.doc(uid).delete();
  };

  const toggleReadiness = async newReadiness => {
    await lobbyCollection.doc(uid).set({ ready: newReadiness }, { merge: true });
  };

  return (
    <div className='container is-fluid'>
      {lobby.map(m => {
        return (
          <article key={m.email} className='tile is-child notification'>
            <p className='title'>
              {m.displayName} - {m.ready ? 'Ready 🎮' : 'Not Ready ❌'}
            </p>
          </article>
        );
      })}
      <div className='columns'>
        {userInLobby && (
          <div className='column is-1'>
            <button className='button is-primary' onClick={() => toggleReadiness(!userInLobby.ready)}>
              {userInLobby.ready ? 'Not Ready!' : 'Ready!'}
            </button>
          </div>
        )}
        <div className='column is-1'>
          {userInLobby ? (
            <button className='button is-primary' onClick={leaveLobby}>
              Leave
            </button>
          ) : (
            <button className='button is-primary' onClick={joinLobby}>
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <SuspenseWithPerf fallback={<p>Loading...</p>} traceId={'loading-app-status'}>
        <Navbar />
        <AuthCheck fallback={<p>Not Logged In...</p>}>
          <Lobby></Lobby>
        </AuthCheck>
      </SuspenseWithPerf>
    </FirebaseAppProvider>
  );
}

createRoot(document.getElementById('root')).render(<App />);
