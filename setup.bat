@echo off
echo Installing project dependencies...
call npm install --legacy-peer-deps react-router-dom @types/react-router-dom @types/node @types/react @types/react-dom @types/jest @testing-library/react @testing-library/jest-dom @testing-library/user-event @testing-library/dom @testing-library/react-hooks @types/testing-library__react-hooks @heroicons/react react-icons tailwindcss postcss autoprefixer

if %ERRORLEVEL% NEQ 0 (
    echo Error installing dependencies. Please run 'npm install' manually.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Installation complete! You can now start the development server with:
echo npm start
pause
