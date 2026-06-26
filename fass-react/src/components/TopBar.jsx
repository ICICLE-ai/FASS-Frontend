import React, { useState } from 'react';
import { Navbar, Button } from 'react-bootstrap';
import HelpModal from './HelpModal';
import WelcomeModal from './WelcomeModal';

const TopBar = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(
    () => sessionStorage.getItem('feast.welcomeSeen') !== 'true'
  );

  const handleCloseHelp = () => setShowHelp(false);
  const handleOpenHelp = () => setShowHelp(true);

  const handleCloseAbout = () => {
    sessionStorage.setItem('feast.welcomeSeen', 'true');
    setShowAbout(false);
  };
  const handleOpenAbout = () => setShowAbout(true);

  return (
    <Navbar expand="lg" fixed="top" style={{ backgroundColor: 'var(--icicle-primary)' }}>
      <Navbar.Brand
        style={{ marginLeft: '10px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        <a
          href="https://icicle.ai/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex' }}
        >
          <img
            src="/icicle-logo.png"
            alt="ICICLE — visit icicle.ai"
            style={{ height: 36, width: 'auto' }}
          />
        </a>
        Food Equity Access Simulation Technology (FEAST)
      </Navbar.Brand>
      <div style={{ marginLeft: 'auto', marginRight: 10 }}>
        <Button
          variant="light"
          size="sm"
          onClick={() => window.open('https://foodaccesssimulator.org/', '_blank', 'noopener,noreferrer')}
          style={{ marginRight: 8 }}
        >
          FEAST Website
        </Button>
        <Button variant="light" size="sm" onClick={handleOpenAbout} style={{ marginRight: 8 }}>
          About
        </Button>
        <Button variant="light" size="sm" onClick={handleOpenHelp}>
          Help
        </Button>
      </div>
      <HelpModal show={showHelp} handleClose={handleCloseHelp} />
      <WelcomeModal show={showAbout} handleClose={handleCloseAbout} />
    </Navbar>
  );
};

export default TopBar;
