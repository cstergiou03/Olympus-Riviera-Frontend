import React, { useState, useEffect, useRef } from "react";
import "../StyleProvider/eventForm.css";
import GoogleMapReact from 'google-map-react';
import Compressor from 'compressorjs';
import { useNavigate } from 'react-router-dom';

function EventForm() {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        location: "",
        siteLink: "",
        phone: "",
        email: "",
        photos: "",
        latitude: null,
        longitude: null,
        eventStart: "",
        eventEnd: "",
    });

    const [destinations, setDestinations] = useState([]);
    const [isCustomLocation, setIsCustomLocation] = useState(false);
    const markerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("https://olympus-riviera.onrender.com/api/destination/get/all")
            .then(response => response.json())
            .then(data => setDestinations(data))
            .catch(error => console.error("Error fetching destinations:", error));
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({
            ...formData,
            [name]: files ? Array.from(files) : value,
        });
    };

    const handleLocationChange = ({ lat, lng }) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            latitude: lat,
            longitude: lng,
        }));
    };

    const handleDestinationChange = (e) => {
        const selectedDestinationName = e.target.value; // Εδώ θα αποθηκεύσουμε το όνομα της τοποθεσίας
        const selectedDestination = destinations.find(
            (destination) => destination.name === selectedDestinationName // Αναζητούμε βάση το όνομα
        );

        if (selectedDestination) {
            setFormData({
                ...formData,
                location: selectedDestination.name, // Αποθήκευση του ονόματος της τοποθεσίας
                latitude: parseFloat(selectedDestination.latitude),
                longitude: parseFloat(selectedDestination.longitude),
            });
        }
    };

    const handleApiLoaded = (map, maps) => {
        map.addListener("click", (event) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            console.log("Latitude:", lat, "Longitude:", lng);

            if (markerRef.current) {
                markerRef.current.setMap(null);
            }

            const newMarker = new maps.Marker({
                position: { lat, lng },
                map,
                title: "Selected Location",
            });

            markerRef.current = newMarker;
            handleLocationChange({ lat, lng });
        });
    };

    const convertImagesToBase64 = (files) => {
        return new Promise((resolve, reject) => {
            if (!files || files.length === 0) {
                resolve("");
            }

            const promises = [];
            files.forEach(file => {
                promises.push(
                    new Promise((resolve, reject) => {
                        new Compressor(file, {
                            quality: 0.6,
                            success(result) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    resolve(reader.result);
                                };
                                reader.onerror = reject;
                                reader.readAsDataURL(result);
                            },
                            error(err) {
                                reject(err);
                            }
                        });
                    })
                );
            });

            Promise.all(promises)
                .then(base64Images => resolve(base64Images.join(',')))
                .catch(reject);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const photosBase64 = await convertImagesToBase64(formData.photos);
        console.log("Base64 Photos:", photosBase64);

        if (!photosBase64) {
            alert("Please upload at least one photo.");
            return;
        }

        const payload = {
            name: formData.name,
            organizer_id: "provider123",
            phone: formData.phone,
            email: formData.email,
            event_start: formData.eventStart,
            event_end: formData.eventEnd,
            latitude: formData.latitude,
            longitude: formData.longitude,
            description: formData.description,
            siteLink: formData.siteLink,
            photos: photosBase64,
        };

        console.log("Payload to send:", payload);

        fetch("https://olympus-riviera.onrender.com/api/provider/event/add-request/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
            .then(response => response.json())
            .then(data => {
                console.log("Response from server:", data);
                alert("Event created successfully!");
                navigate("/provider");
            })
            .catch(error => {
                console.error("Error submitting the form:", error);
                alert("Failed to create event.");
            });
    };

    return (
        <div className="event-form-container">
            <h1>Create a New Event</h1>
            <form className="event-form" onSubmit={handleSubmit}>
                <label htmlFor="name">Event Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="description">Description:</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="eventStart">Event Start:</label>
                <input
                    type="datetime-local"
                    id="eventStart"
                    name="eventStart"
                    value={formData.eventStart}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="eventEnd">Event End:</label>
                <input
                    type="datetime-local"
                    id="eventEnd"
                    name="eventEnd"
                    value={formData.eventEnd}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="customLocation">Custom Location:</label>
                <select
                    id="customLocation"
                    name="customLocation"
                    value={isCustomLocation ? "Ναι" : "Όχι"} // Ανάλογα με την κατάσταση, το value θα είναι "Ναι" ή "Όχι"
                    onChange={(e) => setIsCustomLocation(e.target.value === "Ναι")} // Αν η επιλογή είναι "Ναι", τότε η τιμή γίνεται true
                >
                    <option value="Όχι">Όχι</option>
                    <option value="Ναι">Ναι</option>
                </select>

                {!isCustomLocation && (
                    <>
                        <label htmlFor="location">Location (Select from Dropdown):</label>
                        <select
                            name="location"
                            value={formData.location}
                            onChange={handleDestinationChange}
                            required
                        >
                            <option value="">Select a location</option>
                            {destinations.map((destination) => (
                                <option
                                    key={destination.destination_id}
                                    value={destination.name} // Τώρα χρησιμοποιούμε το όνομα ως τιμή
                                >
                                    {destination.name}
                                </option>
                            ))}
                        </select>
                    </>
                )}

                {isCustomLocation && (
                    <div style={{ height: '500px', width: '100%' }}>
                        <GoogleMapReact
                            bootstrapURLKeys={{
                                key: "AIzaSyCIrKrxTVDqlcRVFNyNMm5iS869G7RYvuc",
                            }}
                            defaultCenter={{
                                lat: 40.0853,
                                lng: 22.3584,
                            }}
                            defaultZoom={9}
                            onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
                            yesIWantToUseGoogleMapApiInternals
                        />
                    </div>
                )}

                <label htmlFor="siteLink">Website Link:</label>
                <input
                    type="url"
                    id="siteLink"
                    name="siteLink"
                    value={formData.siteLink}
                    onChange={handleChange}
                />

                <label htmlFor="phone">Phone:</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="photos">Photos:</label>
                <input
                    type="file"
                    id="photos"
                    name="photos"
                    accept="image/*"
                    multiple
                    onChange={handleChange}
                />

                <button type="submit" className="submit-button">Submit</button>
            </form>
        </div>
    );
}

export default EventForm;