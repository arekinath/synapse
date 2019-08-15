import React, { useState } from 'react';

import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import useAccordionToggle from 'react-bootstrap/useAccordionToggle';

import { PORT_SELECTION_UI } from '../reducers/ui_constants';

import AccordionToggle from '../containers/AccordionToggle';
import ContentWrapper from '../containers/ContentWrapper';

import { next_ui } from '../reducers/setup-ui-reducer';

export default ({
  servername,
  verifyingPorts,
  fedPortInUse,
  clientPortInUse,
  canChangePorts,
  defaultFedPort,
  defaultClientPort,
  onClick,
}) => {
  if (verifyingPorts) {
    return <ContentWrapper><h1>Verifying ports.</h1></ContentWrapper>
  }

  const [fedPort, setFedPort] = useState(defaultFedPort);
  const [clientPort, setClientPort] = useState(defaultClientPort);

  const [clientPortValid, setClientPortValid] = useState(true)
  const [fedPortValid, setFedPortValid] = useState(true)

  const [clientPortPriv, setClientPortPriv] = useState(defaultClientPort < 1024)
  const [fedPortPriv, setFedPortPriv] = useState(defaultFedPort < 1024)

  const [_fedPortInUse, set_fedPortInUse] = useState(fedPortInUse)
  const [_clientPortInUse, set_clientPortInUse] = useState(clientPortInUse)

  const updateValidity = (port, setValid) => setValid(
    !isNaN(port) && 0 < port && port <= 65535
  )

  const updatePriv = (port, setPriv) => setPriv(
    port < 1024
  )

  const onFederationChange = event => {
    const val = event.target.value ? event.target.value : defaultFedPort;
    set_fedPortInUse(false);
    setFedPort(val);
    updatePriv(val, setFedPortPriv);
    updateValidity(val, setFedPortValid);
  }

  const onClientChange = event => {
    const val = event.target.value ? event.target.value : defaultClientPort;
    set_clientPortInUse(false);
    setClientPort(val);
    updatePriv(val, setClientPortPriv);
    updateValidity(val, setClientPortValid);
  }

  const toggle = useAccordionToggle(next_ui(PORT_SELECTION_UI));

  return <Card>
    <AccordionToggle as={Card.Header} eventKey={PORT_SELECTION_UI}>
      {servername}'s ports
    </AccordionToggle>
    <Accordion.Collapse eventKey={PORT_SELECTION_UI}>
      <Card.Body>

        <p>
          Synapse will be listening on the following ports on localhost.
    </p>
        {
          canChangePorts ?
            <p>
              Since you're using a reverse proxy you can change these to anything you
              like as long as synapse can bind to them. We recommend not using privileged
              ports within the range 0 to 1024.
        </p>
            :
            <p>
              Since you're not using a reverse proxy synapse will have to listen on
              these ports. If any of these ports are already in use (we'll test them when
              you click the button) you will either need to reconfigure the ports used on
              localhost, setup up delegation or use a reverse proxy.
        </p>
        }

        <p>
          We will check that the ports are not in use.
        </p>
        <p>
          Note: we can't check whether privileged ports are in use. If you've
          set a privileged port <b>we will skip the check for that port</b>.
        </p>

        <h3>Federation Port</h3>
        <input
          type="text"
          className={_fedPortInUse|!fedPortValid?"invalid":undefined}
          onChange={onFederationChange}
          disabled={canChangePorts ? undefined : true}
          autoFocus
          placeholder={defaultFedPort}
        />
        {_fedPortInUse ? <p>This port is in use.</p> : undefined}
        {fedPortValid ? undefined : <p>Invalid port</p> }
        {fedPortPriv ? <p>This is a privileged port.</p> : undefined}
        <h3>Client Port</h3>
        <input
          type="text"
          className={_clientPortInUse|!clientPortValid?"invalid":undefined}
          onChange={onClientChange}
          disabled={canChangePorts ? undefined : true}
          autoFocus
          placeholder={defaultClientPort}
        />
        {_clientPortInUse ? <p>This port is in use.</p> : undefined}
        {clientPortValid ? undefined : <p>Invalid port</p> }
        {clientPortPriv ? <p>This is a privileged port.</p> : undefined}
        <div>
          <button
            disabled={clientPortValid && fedPortValid ? undefined : true}
            onClick={() => onClick(parseInt(fedPort), parseInt(clientPort), toggle)}
          >Verify These Ports</button>
        </div>
      </Card.Body>
    </Accordion.Collapse>
  </Card>
}