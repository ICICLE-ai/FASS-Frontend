// Legend.js
import React, {useState} from 'react';
import { PiHouseSimpleFill } from "react-icons/pi";
import { PiTriangleDuotone } from "react-icons/pi";
import { PiHexagonDuotone } from "react-icons/pi";
import { FaCaretDown, FaCaretUp } from 'react-icons/fa'; // Arrow icons for expand/collapse
// Legend container styles
const legendStyle = {
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)',
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    zIndex: 1000,
};

const legendItemStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '5px',
    fontSize: '15px'
};

// Color box style for other items
const colorBoxStyle = {
    width: '15px',
    height: '15px',
    marginRight: '5px',
    backgroundColor: 'blue', // Default color for household
};

// Define legend items with icons and labels
const legendItems = [
    { icon: <PiHexagonDuotone color="blue" />, label: 'Supermarket' },
    { icon: <PiTriangleDuotone color="blue" />, label: 'Convenience Store' },
    { icon: <PiHouseSimpleFill color="#52DF20"/>, label: 'Household MFAI = 100' },
    { icon: <PiHouseSimpleFill color="#D8DF20"/>, label: 'Household MFAI = 75' },
    { icon: <PiHouseSimpleFill color="#CD571D"/>, label: 'Household MFAI <= 50' }
];

const Legend = () => {
    const [isExpanded, setIsExpanded] = useState(true); // State to track if the legend is expanded

    const toggleLegend = () => {
        setIsExpanded(prevState => !prevState); // Toggle the expanded state
    };

    return (
        <div style={{ ...legendStyle, height: isExpanded ? 'auto' : '40px' }}>
            {/* Minimize/Expand Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h6 style={{ margin: 0 }}>Legend</h6>
                <button onClick={toggleLegend} style={buttonStyle}>
                    {isExpanded ? <FaCaretUp /> : <FaCaretDown />}
                </button>
            </div>

            {/* Legend Items */}
            {isExpanded && (
                <div>
                    {legendItems.map((item, index) => (
                        <div key={index} style={legendItemStyle}>
                            {item.icon || <div style={{ ...colorBoxStyle, backgroundColor: item.color }} />}
                            <span style={{ marginLeft: '5px' }}>{item.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const buttonStyle = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '5px',
};

export default Legend;
