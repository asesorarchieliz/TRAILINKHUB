import React, { useState, useEffect } from 'react';
import { CirclePicker } from 'react-color';
import './styles/ColorPickerSection.css';

function ColorPickerSection({ onColorChange, onSubmitColorChange, onSecondaryColorChange, onSubmitSecondaryColorChange, onFontColorChange, onSubmitFontColorChange, initialPrimaryColor, initialSecondaryColor, initialFontColor }) {
  const defaultPrimaryColor = '#dbf8ff'; // Default background color
  const defaultSecondaryColor = '#f4f4f4'; // Default secondary color
  const defaultFontColor = '#000000'; // Default font color

  const [selectedColor, setSelectedColor] = useState(initialPrimaryColor || defaultPrimaryColor);
  const [selectedSecondaryColor, setSelectedSecondaryColor] = useState(initialSecondaryColor || defaultSecondaryColor);
  const [selectedFontColor, setSelectedFontColor] = useState(initialFontColor || defaultFontColor);
  const [colorType, setColorType] = useState('background'); // State to track the selected color type
  const [hexInput, setHexInput] = useState('#'); // State to track the hex input
  const [isValidHex, setIsValidHex] = useState(true); // State to track if the hex input is valid

  useEffect(() => {
    setSelectedColor(initialPrimaryColor || defaultPrimaryColor);
  }, [initialPrimaryColor]);

  useEffect(() => {
    setSelectedSecondaryColor(initialSecondaryColor || defaultSecondaryColor);
  }, [initialSecondaryColor]);

  useEffect(() => {
    setSelectedFontColor(initialFontColor || defaultFontColor);
  }, [initialFontColor]);

  const handleChange = (color) => {
    if (colorType === 'background') {
      setSelectedColor(color.hex);
      onColorChange(color.hex);
    } else if (colorType === 'secondary') {
      setSelectedSecondaryColor(color.hex);
      onSecondaryColorChange(color.hex);
    } else if (colorType === 'font') {
      setSelectedFontColor(color.hex);
      onFontColorChange(color.hex);
    }
    setHexInput(color.hex); // Update the hex input field
  };

  const handleHexInputChange = (e) => {
    const hex = e.target.value;
    setHexInput(hex);
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      setIsValidHex(true);
      handleChange({ hex });
    } else {
      setIsValidHex(false);
    }
  };

  const handleSubmit = () => {
    if (colorType === 'background') {
      onSubmitColorChange(selectedColor);
    } else if (colorType === 'secondary') {
      onSubmitSecondaryColorChange(selectedSecondaryColor);
    } else if (colorType === 'font') {
      onSubmitFontColorChange(selectedFontColor);
    }
  };

  const handleRemoveColor = () => {
    if (colorType === 'background') {
      setSelectedColor(defaultPrimaryColor);
      onColorChange(defaultPrimaryColor);
      onSubmitColorChange(defaultPrimaryColor);
    } else if (colorType === 'secondary') {
      setSelectedSecondaryColor(defaultSecondaryColor);
      onSecondaryColorChange(defaultSecondaryColor);
      onSubmitSecondaryColorChange(defaultSecondaryColor);
    } else if (colorType === 'font') {
      setSelectedFontColor(defaultFontColor);
      onFontColorChange(defaultFontColor);
      onSubmitFontColorChange(defaultFontColor);
    }
    setHexInput('#'); // Clear the hex input field and reset to #
    setIsValidHex(true); // Reset the hex input validity
  };

  const handleColorTypeChange = (e) => {
    setColorType(e.target.value);
  };

  return (
    <div className="color-picker-section">
      <h3>Pick a Color to Edit</h3>
      <select value={colorType} onChange={handleColorTypeChange} className="color-type-dropdown">
        <option value="background">Background Color</option>
        <option value="secondary">Secondary Color</option>
        <option value="font">Font Color</option>
      </select>

      {colorType === 'background' && (
        <>
          <h3>Pick a Background Color</h3>
          <CirclePicker color={selectedColor} onChange={handleChange} />
        </>
      )}

      {colorType === 'secondary' && (
        <>
          <h3>Pick a Secondary Color</h3>
          <CirclePicker color={selectedSecondaryColor} onChange={handleChange} />
        </>
      )}

      {colorType === 'font' && (
        <>
          <h3>Pick a Font Color</h3>
          <CirclePicker color={selectedFontColor} onChange={handleChange} />
        </>
      )}

      <div className="hex-input-container">
        <input
          type="text"
          value={hexInput}
          onChange={handleHexInputChange}
          placeholder="Enter hex code"
          className={`hex-input ${isValidHex ? '' : 'invalid'}`}
        />
        <div className="color-preview" style={{ backgroundColor: isValidHex ? hexInput : 'transparent' }} />
      </div>

      <div className="button-container">
        <button className="save-button" onClick={handleSubmit}>Submit</button>
        <button className="remove-button" onClick={handleRemoveColor}>Reset</button>
      </div>
    </div>
  );
}

export default ColorPickerSection;