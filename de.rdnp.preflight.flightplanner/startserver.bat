cmd /C curl -X POST localhost:8080/shutdownContext
start "product-server" java -jar %1
exit /b 0