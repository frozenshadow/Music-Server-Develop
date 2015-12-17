@echo off
echo Now updating all dependencies
echo.
CALL bower update
echo.
pause
echo.
echo Get only the necessary files
echo.
CALL bower-installer
echo.
echo All done!
echo.
pause