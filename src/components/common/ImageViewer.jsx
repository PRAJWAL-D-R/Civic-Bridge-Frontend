import React from 'react';
import './ImageViewer.css';

const ImageViewer = ({ images, onClose }) => {
   return (
      <div className="image-viewer-overlay" onClick={onClose}>
         <div className="image-viewer-content" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={onClose}>×</button>
            <div className="image-container">
               {images.map((image, index) => (
                  <img
                     key={index}
                     src={image}
                     alt={`Complaint ${index + 1}`}
                     className="viewer-image"
                  />
               ))}
            </div>
         </div>
      </div>
   );
};

export default ImageViewer; 