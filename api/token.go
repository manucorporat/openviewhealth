package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/sethealth/sethealth-go"
)

func Handler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		origin := r.Header.Get("Origin")
		if isValidOrigin(origin) {
			client := sethealth.New()
			token, err := client.GetToken()
			if err != nil {
				fmt.Println(err)
				w.WriteHeader(500)
				return
			}

			w.Header().Add("Access-Control-Allow-Origin", origin)
			w.WriteHeader(200)
			json.NewEncoder(w).Encode(token)
		} else {
			w.WriteHeader(401)
		}
	} else {
		w.WriteHeader(404)
	}
}

func isValidOrigin(origin string) bool {
	if origin == "https://openview.health" {
		return true
	}
	if strings.HasPrefix(origin, "http://localhost:") {
		return true
	}
	return false
}
