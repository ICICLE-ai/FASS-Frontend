import React from 'react';
import { Modal, Button, Accordion } from 'react-bootstrap';

const HelpModal = ({ show, handleClose }) => {
  return (
    <Modal id="help" show={show} onHide={handleClose} size="lg" scrollable centered>
      <Modal.Header closeButton>
        <Modal.Title>Help</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>
          The Food Equity Access Simulation Technology (FEAST) tool lets you
          model how adding or removing stores affects household food access in
          a community. Each section below covers a part of the interface — click
          to expand.
        </p>

        <Accordion defaultActiveKey="0" flush>
          <Accordion.Item eventKey="0">
            <Accordion.Header>Example use case</Accordion.Header>
            <Accordion.Body>
              <ol className="mb-0">
                <li>
                  <strong>Add a store</strong> in an underserved area — for
                  example, place "Charlie's Market" near a park.
                </li>
                <li>
                  <strong>Advance the simulation</strong> several months to see
                  how access improves, especially for households without
                  vehicles.
                </li>
                <li>
                  <strong>Remove a store</strong> and watch access challenges
                  re-emerge.
                </li>
              </ol>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1">
            <Accordion.Header>Map legend</Accordion.Header>
            <Accordion.Body>
              <ul className="mb-0">
                <li><strong>Supermarkets</strong> — hexagons</li>
                <li><strong>Convenience stores</strong> — small triangles</li>
                <li>
                  <strong>Households</strong> — house-shaped markers, colored by
                  food access score:
                  <ul>
                    <li><span style={{ color: '#2e7d32' }}>Green</span> — high access</li>
                    <li><span style={{ color: '#ef6c00' }}>Orange / Yellow</span> — medium access</li>
                    <li><span style={{ color: '#c62828' }}>Red</span> — low access</li>
                  </ul>
                </li>
              </ul>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="2">
            <Accordion.Header>Household data</Accordion.Header>
            <Accordion.Body>
              <p>Each household has the following attributes:</p>
              <ul>
                <li>Income</li>
                <li>Household size</li>
                <li>Number of vehicles</li>
                <li>Number of workers</li>
                <li>Proximity to the nearest store (within a mile)</li>
                <li>Transit time (public and private)</li>
                <li>Food access score</li>
              </ul>
              <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                Data is sourced from the US Census Bureau and Google Maps, with
                granularity at the census tract level.
              </p>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="3">
            <Accordion.Header>How to use the tool</Accordion.Header>
            <Accordion.Body>
              <dl className="mb-0">
                <dt>Add a store</dt>
                <dd>
                  Click <strong>Add Store</strong>, then click on the map where
                  you'd like the store. Enter its name and type.
                </dd>

                <dt>Advance the simulation</dt>
                <dd>
                  Click <strong>Advance Month</strong> to step forward by one
                  month. Repeat to see longer-term effects.
                </dd>

                <dt>Remove a store</dt>
                <dd>
                  Select one or more stores on the map, then click{' '}
                  <strong>Remove Store</strong>.
                </dd>

                <dt>Reset</dt>
                <dd>
                  Click <strong>Reset Simulation</strong> to undo all changes
                  and return to month 0.
                </dd>
              </dl>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="4">
            <Accordion.Header>Tips</Accordion.Header>
            <Accordion.Body>
              <ul className="mb-0">
                <li>
                  Review community data before making changes — target areas
                  with low food access first.
                </li>
                <li>
                  Run the simulation forward several months to see long-term
                  effects, not just immediate shifts.
                </li>
              </ul>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <hr className="my-4" />
        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
          FEAST is part of the{' '}
          <a href="https://icicle.ai/" target="_blank" rel="noopener noreferrer">
            ICICLE Institute
          </a>
          . Visit the project page for more about the broader research program.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default HelpModal;
