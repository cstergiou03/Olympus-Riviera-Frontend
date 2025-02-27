import React from "react";
import { useNavigate } from "react-router-dom";
import "../Style/experienceRecord.css";

function Records({ data }) {
    const navigate = useNavigate();

    // Υπολογισμός entity_id και type
    const entity_id = data.destination_id || data.activity_id;
    const entity_type = data.destination_id ? "destination" : "activity";

    const googleMapsLink = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
    
    const photosTable = data.photos
        ? data.photos
              .split("data:image/jpeg;base64,")
              .filter((photo) => photo.trim() !== "")
              .map((photo) =>
                  "data:image/jpeg;base64," + photo.trim().replace(/,$/, "")
              )
        : [];

    return (
        <div className="experience-record">
            <div className="record-column">{data.name}</div>
            <div className="record-column">{data.description}</div>
            <div className="record-column">
                {photosTable.length > 0 ? (
                    <img
                        src={photosTable[1]}
                        className="record-image"
                        alt="Experience"
                    />
                ) : null}
            </div>
            <div className="record-column">
                <button
                    onClick={() => navigate(`/admin/edit-${entity_type}/${entity_id}`)}
                    className="more-btn"
                >
                    Περισσότερα
                </button>
            </div>
        </div>
    );
}

export default Records;
