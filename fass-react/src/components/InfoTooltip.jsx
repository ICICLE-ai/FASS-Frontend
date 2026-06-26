import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const InfoTooltip = ({ text, children, placement = 'right' }) => (
  <OverlayTrigger
    placement={placement}
    overlay={<Tooltip>{text}</Tooltip>}
  >
    <span style={{ display: 'inline-block' }}>{children}</span>
  </OverlayTrigger>
);

export default InfoTooltip;
