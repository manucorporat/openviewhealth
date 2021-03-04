package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/sethealth/sethealth-go"
)

func Handler(w http.ResponseWriter, r *http.Request) {

	client := sethealth.New()
	token, err := client.GetToken()
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(500)
		return
	}
	origin := r.Header.Get("Origin")
	if strings.HasPrefix(origin, "http://localhost:") {
		w.Header().Add("Access-Control-Allow-Origin", origin)
	}
	w.WriteHeader(200)
	json.NewEncoder(w).Encode(token)
}
