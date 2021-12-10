const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express();
const mysql = require('mysql')
const {sign} = require('jsonwebtoken')
const {validateToken} = require('./middlewares/AuthUser')
const {validate_token} = require('./middlewares/AuthJWT');
const { response } = require('express');

const port = process.env.PORT || 3001;

/*const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Reidekonoh@753',
    database: 'tcc',
})
*/
const db = mysql.createPool({
    host: 'mysqlserver.cvk4ethxrqps.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: 'Reidekonoha753',
    database: 'ask_if',
})

app.use(cors())
app.use(express.json({limit: '40mb'}))
app.use(express.urlencoded({extended:true, limit: '40mb'}))


app.get("/perguntas", validate_token, (req, res)=>{
const query= "SELECT ID_P, TITULO, CONTEUDO, MATRICULA, MATERIA, RESPONDIDA, NOME_USUARIO, NOME_MATERIA FROM perguntas ORDER BY ID_P desc LIMIT 20"
db.query(query, (err,result)=>{
var resultado =  result
res.json({result: resultado})
});
});


app.get("/exist", validate_token, (req, res)=>{

    const matricula = req.user.sub
    const email = req.header('email')
    const query= "SELECT * FROM usuario WHERE matricula = ?"
    
    db.query(query, [matricula], (err,result)=>{
        if(typeof(result[0]) === "undefined"){
            var emailsplit = email.split("@");
            var professorsplit = emailsplit[0].split(".");
            var nomeprofessor = professorsplit[0] + " " + professorsplit[1];
           if(professorsplit.length === 2 && email.includes("aluno") === false){
        const query2 = "INSERT INTO usuario (matricula,nome,email,cargo) VALUES(?,?,?,2)"
            db.query(query2, [matricula,nomeprofessor,email], (err,result)=>{
                res.json({status: 2})
            })

           
           }else{
            res.json({status: 0})
           }


           }else{
    var testeprofessor = matricula.split(".");

    if(testeprofessor.length == 2){
        var nome2 = result[0].nome
        var cargo2 = result[0].cargo
        var materia2 = result[0].materia
        var pontos2 = result[0].pontos
        var email2 = result[0].email
        var curso2 = result[0].curso
        
        res.json({status: 2, nome:nome2, matricula: matricula, cargo: cargo2, materia: materia2, pontos: pontos2, email: email2, curso: curso2})

    }else{
            var nome2 = result[0].nome
            var cargo2 = result[0].cargo
            var materia2 = result[0].materia
            var pontos2 = result[0].pontos
            var email2 = result[0].email
            var curso2 = result[0].curso
        
            res.json({status: 1, nome:nome2, matricula: matricula, cargo: cargo2, materia: materia2, pontos: pontos2, email: email2, curso: curso2})
    }
}
           
    
    });
    });


app.post("/cadastro", validate_token, (req, res)=>{
 
    const nome = req.body.nome
    const curso = req.body.curso
    const email = req.body.email
    const matricula = req.user.sub
   

    const query= "INSERT INTO usuario (matricula,nome,email,curso) VALUES(?,?,?,?)"
    db.query(query, [matricula,nome,email,curso], (err,result)=>{
        
        res.send(result)
        });
 
    });







app.post("/get_answers", (req, res)=>{
    const id = req.body.id
     // ORDER BY (CASE WHEN DeptName = 'Not Assigned' THEN 0 ELSE 1 END), DeptName
    const query= "SELECT resposta,id_pergunta,id_resposta,situacao,Nome_User,matricula_user FROM respostas WHERE id_pergunta = ? ORDER BY (CASE WHEN situacao = 1 THEN 0 ELSE 1 END), id_resposta DESC"
    //WHERE id_pergunta = ? ORDER BY id_resposta DESC "
    db.query(query, [id], (err,result)=>{
    res.send(result)
    });
    });

    app.post("/set_answers",validate_token,( req, res)=>{
        
        const comentario = req.body.comentario
        const id_pergunta = req.body.id
        const cargo = req.body.cargo
        const nome = req.body.nome
        const materiaUser = req.body.materia_usuario
        const materiaPergunta = req.body.materia_pergunta
        const matricula_user = req.body.matricula
        const files = req.body.arquivos
        
        if((cargo===1 || cargo ===2)){
            if(materiaUser === materiaPergunta){
                var query= "INSERT INTO respostas(resposta,id_pergunta,situacao,Nome_User,matricula_user,arquivos) VALUES (?,?,1,?,?,?)"
            }else{
                var query= "INSERT INTO respostas(resposta,id_pergunta,Nome_User,matricula_user,arquivos) VALUES (?,?,?,?,?)"
            }
            
        }else{
            if(cargo === 0){
                var query= "INSERT INTO respostas(resposta,id_pergunta,Nome_User,matricula_user,arquivos) VALUES (?,?,?,?,?)"
            }
        }
        db.query(query, [comentario,id_pergunta,nome,matricula_user,files], (err,result)=>{
        
        res.send(result)
        });
        });


        app.post("/set_questions",validate_token,(req, res)=>{
       
            const conteudo = req.body.conteudo
            const titulo = req.body.titulo
            const matricula = req.body.matricula
            const nome = req.body.nome
            const materia = req.body.materia
            const nomemateria = req.body.nomemateria
            const files = req.body.ARQUIVOS
            
            const query= "INSERT INTO perguntas(TITULO,CONTEUDO,MATRICULA,MATERIA,NOME_USUARIO,NOME_MATERIA,ARQUIVOS) VALUES (?,?,?,?,?,?,?)"
            db.query(query, [titulo,conteudo,matricula,materia,nome,nomemateria,files], (err,result)=>{
            
            res.send(result)
            });
            });

            app.post("/delete_question", (req, res)=>{
                
                const id = req.body.id_p
                const query= "DELETE FROM perguntas WHERE ID_P = ?;"
               db.query(query, [id], (err,result)=>{
                
                res.send(result)
                });
                });

            app.get("/get_materias",(req,res)=>{

            const query = "SELECT * FROM materia"
            db.query(query, (err,result)=>{
                res.json({result: result})
                });
            });

                app.post("/delete_answer", (req, res)=>{
                    const id = req.body.id_r
                    const query= "DELETE FROM respostas WHERE id_resposta = ?;"
                   db.query(query, [id], (err,result)=>{
                   
                    res.send(result)
                    });
                    });

                    
                    app.post("/validate_answer", (req, res)=>{
                        
                        const id = req.body.id
                        const query= "UPDATE respostas SET situacao = 1 WHERE id_resposta = ? "
                       db.query(query, [id], (err,result)=>{
                        
                        res.send(result)
                        });
                        });


     

app.post("/get_monitores",(req, res)=>{
    const materia = req.body.materia
    const query= "SELECT * FROM usuario WHERE cargo=1 AND materia = ?"
    db.query(query, [materia], (err,result)=>{
    res.send({result: result})
   });
    });

    app.post("/excluir_monitores",(req, res)=>{
        const matricula = req.body.matricula
        const query= "UPDATE usuario SET cargo = 0, materia = null  WHERE matricula = ? "
        db.query(query, [matricula], (err,result)=>{
        res.send({result: result})
       });
        });

        app.post("/set_new_monitor",(req, res)=>{
            const matricula = req.body.matricula
            const materia = req.body.materia
            const query= "UPDATE usuario SET cargo = 1, materia = ?  WHERE matricula = ? "
            db.query(query, [materia,matricula], (err,result)=>{
            res.send({result: result})
           });
            });


            app.post("/getMateria",(req, res)=>{
                const id = req.body.id_p
                const query= "SELECT MATERIA FROM perguntas WHERE ID_P = ?"
                db.query(query, [id], (err,result)=>{
                res.send({result: result})
               });
                });


                app.post("/add_points", (req, res)=>{
                 
                    const matricula = req.body.matricula
                    const query= "UPDATE tcc.usuario SET pontos = pontos + 10 WHERE matricula = ?"
                   db.query(query, [matricula], (err,result)=>{
                    res.send(result)
                    });
                    });

                    app.get("/test_token",validate_token,(req,res)=>{
                    res.send(1)
                    });

                    app.post("/getFilesByQuestions", (req, res)=>{
                        const id = req.body.id

                        const query= "SELECT ARQUIVOS FROM perguntas WHERE ID_P = ?"
                      
                        db.query(query, [id], (err,result)=>{
                        res.send(result)
                        });
                        });

                        app.post("/getFilesByAnswers", (req, res)=>{
                            const id = req.body.id
    
                            const query= "SELECT arquivos FROM respostas WHERE id_resposta = ?"
                          
                            db.query(query, [id], (err,result)=>{
                               
                            res.send(result)
                            });
                            });

app.post("/getInfos", (req, res)=>{
const mat = req.body.materia
        
const query= "SELECT * FROM informacoes_monitores WHERE materia = ?"
                              
db.query(query, [mat], (err,result)=>{
                                   
res.send(result)
});
});

app.post("/InsertInfos",validate_token,(req, res)=>{
console.log(req.body)

const materia = req.body.materia
const nome = req.body.nome
const email = req.body.email
const horario = req.body.horario
const link = req.body.link

const query= "INSERT INTO informacoes_monitores (materia,nome,email,horario,link) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE nome=?, email=?, horario=?, link=?"
                                  
db.query(query, [materia,nome,email,horario,link,nome,email,horario,link], (err,result)=>{

res.send(result)
});
});


app.post("/getPosts",validate_token,(req, res)=>{
const materia = req.body.materia
                
const query= "SELECT id_post,Titulo,Conteudo,materia,matricula_monitor FROM posts_monitores WHERE materia = ? ORDER BY id_post DESC"
                                      
db.query(query, [materia], (err,result)=>{
                                 
res.send(result)
});
});

app.post("/InsertPosts",validate_token,(req, res)=>{
const titulo = req.body.titulo
const conteudo = req.body.conteudo
const arquivos = req.body.files
const matricula = req.body.matricula
const materia = req.body.materia
                    
const query= "INSERT INTO posts_monitores (Titulo,Conteudo,materia,arquivos,matricula_monitor) VALUES(?,?,?,?,?)"
                                          
            db.query(query, [titulo,conteudo,materia,arquivos,matricula], (err,result)=>{
                                               
            res.send(result)
            });
            });




            app.post("/getFilesByPosts", (req, res)=>{
                const id = req.body.id

                const query= "SELECT arquivos FROM posts_monitores WHERE id_post = ?"
              
                db.query(query, [id], (err,result)=>{
                   
                res.send(result)
                });
                });

app.post("/getQuestionsByWhere",validate_token,(req, res)=>{
                    const where = req.body.where
                    const query= "SELECT ID_P, TITULO, CONTEUDO, MATRICULA, MATERIA, RESPONDIDA, NOME_USUARIO, NOME_MATERIA FROM perguntas  WHERE "+where
                    db.query(query, (err,result)=>{
                    res.send({result: result})
                   });
                    });

app.listen(port,()=>{
    console.log('porta 3001 aberta');
})


//http://localhost:3001/set_answers
