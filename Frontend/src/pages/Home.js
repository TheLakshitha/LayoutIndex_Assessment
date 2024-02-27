import React, { useEffect, useState } from "react";

const Home = () => {
    const [locations, setLocations] = useState([]);
    const [displayLocations, setDisplayLocations] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState("");
    const [addLocationMessage, setAddLocationMessage] = useState("");
    const [showLocationManager, setShowLocationManager] = useState(false);
    const [disableFields, setDisableFields] = useState({
        disableName: false,
        disableAddress: false,
        disablePhone: false
    });
    const [searchQuery, setSearchQuery] = useState("");

    const [newLocationData, setNewLocationData] = useState({
        name: "",
        address: "",
        phone: "",
        devices: []
    });

    const fetchLocations = async () => {
        try {
            const response = await fetch('/api/locations');
            if (response.ok) {
                const json = await response.json();
                setLocations(json);
            } else {
                throw new Error('Failed to fetch locations');
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    useEffect(() => {
        if (displayLocations) {
            fetchLocations();
        }
    }, [displayLocations]);

    const handleDisplayLocations = async () => {
        setDisplayLocations(true);
        setShowLocationManager(false); // Hide Location Manager when displaying locations

        // Fetch updated list of locations
        await fetchLocations();
    };

    const handleDeleteDevice = async (locationId, deviceId) => {
        try {
            const response = await fetch(`/api/locations/${locationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    devices: {
                        remove: deviceId
                    }
                })
            });

            if (response.ok) {
                setDeleteMessage("Device deleted successfully.");
                // Refresh locations after deletion
                await fetchLocations();
            } else {
                throw new Error('Failed to delete device');
            }
        } catch (error) {
            console.error('Error deleting device:', error);
            setDeleteMessage("Failed to delete device.");
        }
    };

    const handleAddLocation = async () => {
        try {
            // Fetch existing serial numbers
            const response = await fetch('/api/locations');
            if (!response.ok) {
                throw new Error('Failed to fetch existing locations');
            }
            const json = await response.json();
            const existingSerialNumbers = json.reduce((acc, location) => {
                location.devices.forEach(device => acc.push(device.serialNumber));
                return acc;
            }, []);

            // Check if serial number already exists
            const existingSerialNumber = existingSerialNumbers.find(serial => serial === newLocationData.devices[0].serialNumber);
            if (existingSerialNumber) {
                setAddLocationMessage("Serial number already exists.");
                return;
            }

            // If serial number is unique, proceed with adding the location
            const addResponse = await fetch('/api/locations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newLocationData)
            });

            if (addResponse.ok) {
                setAddLocationMessage("Location added successfully.");
                // Refresh locations after addition
                await fetchLocations();
            } else {
                throw new Error('Failed to add location');
            }
        } catch (error) {
            console.error('Error adding location:', error);
            setAddLocationMessage("Failed to add location.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let limitedValue = value;
        let disableName = false;
        let disableAddress = false;
        let disablePhone = false;
    
        if (name === 'name') {
            if (/\d/.test(value)) {
                setAddLocationMessage("You can only enter letters in the name field.");
                disableAddress = true;
                disablePhone = true;
            } else {
                setAddLocationMessage("");
                limitedValue = value.slice(0, 35);
            }
        
        } else if (name === 'phone') {
            // Check if the value contains only numbers
            if (!/^\d+$/.test(value)) {
                // If it contains non-numeric characters, display a warning message
                setAddLocationMessage("Phone number can only contain numbers.");
                disableName = true;
                disableAddress = true;
            } else {
                // If it contains only numbers, clear the warning message
                setAddLocationMessage("");
                limitedValue = value.slice(0, 10); // Limit phone number to 10 characters
            }
        }
    
        setNewLocationData(prevData => ({
            ...prevData,
            [name]: limitedValue
        }));
    
        // Disable fields based on conditions
        setDisableFields({ disableName, disableAddress, disablePhone });
    };

    const handleDeviceInputChange = (e, index) => {
        const { name, value } = e.target;
        let limitedValue = value;
        if (name === 'serialNumber') {
            limitedValue = value.slice(0, 5); // Limit serial number to 5 characters
        }
        const updatedDevices = [...newLocationData.devices];
        updatedDevices[index][name] = limitedValue;
        setNewLocationData(prevData => ({
            ...prevData,
            devices: updatedDevices
        }));
    };

    const addNewDevice = () => {
        if (newLocationData.devices.length < 3) {
            setNewLocationData(prevData => ({
                ...prevData,
                devices: [...prevData.devices, { serialNumber: "", type: "", image: "", status: "" }]
            }));
        } else {
            alert("You have reached the limit of 3 devices.");
        }
    };

    const handleFileInputChange = (e, index) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            const imageData = reader.result;
            const updatedDevices = [...newLocationData.devices];
            updatedDevices[index].image = imageData; // Store image data
            setNewLocationData(prevData => ({
                ...prevData,
                devices: updatedDevices
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleStatusChange = (e, index, status) => {
        const updatedDevices = [...newLocationData.devices];
        updatedDevices[index].status = status;
        setNewLocationData(prevData => ({
            ...prevData,
            devices: updatedDevices
        }));
    };

    const removeDevice = (index) => {
        const updatedDevices = [...newLocationData.devices];
        updatedDevices.splice(index, 1);
        setNewLocationData(prevData => ({
            ...prevData,
            devices: updatedDevices
        }));
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="mainBox">
            <div className="mainButtons">
                <button className="button-81" onClick={handleDisplayLocations}>Display all locations</button>
                <button className="button-81" onClick={() => setShowLocationManager(true)}>Location Manager</button> {/* Location Manager button */}
            </div>

            <div className="detailBox">
                {deleteMessage && <p>{deleteMessage}</p>}
                {showLocationManager ? (
                    <div className="locationForm"> 
                        <h2>Add New Location</h2>
                        <label>Name</label>
                        <input type="text" name="name" placeholder="Name" value={newLocationData.name} onChange={handleInputChange} maxLength={35} disabled={disableFields.disableName} />
                        <label>Address</label>
                        <input type="text" name="address" placeholder="Address" value={newLocationData.address} onChange={handleInputChange} maxLength={40} disabled={disableFields.disableAddress} />
                        <label>Phone</label>
                        <input type="text" name="phone" placeholder="Phone" value={newLocationData.phone} onChange={handleInputChange} maxLength={10} disabled={disableFields.disablePhone} />
                        <hr></hr>
                        
                        <button onClick={addNewDevice}>Add New Device</button>
                        {newLocationData.devices.map((device, index) => (
                            <div className="addDevice">
                                <div key={index}>
                                    <input type="text" name="serialNumber" placeholder="Serial Number" value={device.serialNumber} onChange={(e) => handleDeviceInputChange(e, index)} maxLength={5} />
                                    <div className="select">
                                        <select name="type" value={device.type} onChange={(e) => handleDeviceInputChange(e, index)}> {/* Dropdown for device type */}
                                            <option value="">Select Type</option>
                                            <option value="pos">POS</option>
                                            <option value="kiosk">Kiosk</option>
                                            <option value="signage">Signage</option>
                                        </select>
                                    </div>
                                    
                                    <input type="file" name="image" onChange={(e) => handleFileInputChange(e, index)} /> {/* Input for image */}
                                    <div>
                                        <label className="radioLb">Select Status</label>
                                        <label >
                                            <input
                                                type="radio"
                                                name={`status-${index}`}
                                                checked={device.status === "active"}
                                                onChange={(e) => handleStatusChange(e, index, "active")}
                                            />
                                            Active
                                        </label>
                                        <label >
                                            <input
                                                type="radio"
                                                name={`status-${index}`}
                                                checked={device.status === "inactive"}
                                                onChange={(e) => handleStatusChange(e, index, "inactive")}
                                            />
                                            Inactive
                                        </label>
                                    </div>
                                    <button className="btnRemove" onClick={() => removeDevice(index)}>Remove Device</button>
                                </div>
                            </div>
                        ))}
                        <button className="btnCreate" onClick={handleAddLocation}>Create</button>
                        {addLocationMessage && <p>{addLocationMessage}</p>}

                    </div>
                        
                ) : null}
                {displayLocations && !showLocationManager && (
                    <div className="locations">
                        <h2>Locations</h2>
                       <div className="serachBar">
                            <input type="text" class="searchTerm" placeholder="Search by location name" onChange={handleSearch} />
                       </div>
                        
                        
                        {locations.filter(location => location.name.toLowerCase().includes(searchQuery.toLowerCase())).map(location => (
                            <div className="locationBox" key={location._id}>
                                <div className="locationDetails">
                                    <p><b>Name :</b> {location.name}</p>
                                    <p><b>Address: </b> {location.address}</p>
                                    <p><b>Phone: </b> {location.phone}</p>
                                    <p><b>Devices:</b> </p>
                                </div>
                                <ul>
                                    {location.devices.map((device, index) => (
                                        <li key={device._id}>
                                            <div className="deviceBox">
                                                <p>Serial Number: {device.serialNumber}</p>
                                                <p>Type: {device.type}</p>
                                                <p>Status: {device.status}</p>
                                            </div>
                                            <div className="imgBox">
                                                <div className="imgBoxIn">{device.image && <img src={device.image} alt="Device" className="device-image" />}</div>
                                                <div className="btnBox"><button className="noselect" onClick={() => handleDeleteDevice(location._id, device._id)}><span class="text">Delete</span><span class="icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path></svg></span></button></div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
