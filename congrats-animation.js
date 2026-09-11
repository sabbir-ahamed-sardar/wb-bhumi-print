// Congratulation Popup Animation
window.showCongratsPopup = function() {
    try {
        // Check if popup already exists
        if (document.getElementById('congratsPopup')) {
            console.warn('Congrats popup already exists');
            return;
        }
        
        // Create the congratulation popup element
        const congratsPopup = document.createElement('div');
        congratsPopup.id = 'congratsPopup';
        congratsPopup.innerHTML = `
        <div class="congrats-overlay">
            <div class="congrats-content">
                <div class="congrats-icon">🎉</div>
                <h2>Congratulations!</h2>
                <p>Your registration was successful!</p>
                <p>You can now use all features.</p>
                <button id="closeCongrats">Continue</button>
            </div>
        </div>
    `;

    // Add styles for the popup
    const style = document.createElement('style');
    style.textContent = `
        #congratsPopup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        }

        .congrats-overlay {
            background: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            width: 90%;
            position: relative;
            animation: scaleIn 0.3s ease-out;
        }

        .congrats-icon {
            font-size: 60px;
            margin-bottom: 20px;
            animation: bounce 1s infinite;
        }

        .congrats-content h2 {
            color: #4CAF50;
            margin-bottom: 15px;
            font-size: 24px;
        }

        .congrats-content p {
            color: #666;
            margin-bottom: 10px;
            font-size: 16px;
        }

        #closeCongrats {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 20px;
            transition: all 0.3s ease;
        }

        #closeCongrats:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes scaleIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
    `;

    // Append elements to the document
    document.head.appendChild(style);
    document.body.appendChild(congratsPopup);

    // Add event listener to close button
    document.getElementById('closeCongrats').addEventListener('click', function() {
        document.body.removeChild(congratsPopup);
        document.head.removeChild(style);
    });

    // Auto close after 3 seconds
    setTimeout(function() {
        if (document.getElementById('congratsPopup')) {
            document.body.removeChild(congratsPopup);
            document.head.removeChild(style);
        }
    }, 3000);
    
    } catch (error) {
        console.error('Error creating congrats popup:', error);
    }
};