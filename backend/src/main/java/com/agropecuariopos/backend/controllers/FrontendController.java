package com.agropecuariopos.backend.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class FrontendController {

    /**
     * Resuelve las rutas de React-Router reenviándolas al index.html de los archivos estáticos.
     * Ignora las rutas que empiezan por /api
     */
    @RequestMapping(value = { "/", "/{x:[\\w\\-]+}", "/{x:^(?!api$).*$}/**/{y:[\\w\\-]+}" })
    public String getIndex() {
        return "forward:/index.html";
    }
}
