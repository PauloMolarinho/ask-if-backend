const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const mysql = require('mysql');
const {sign} = require('jsonwebtoken');
const {validateToken} = require('./middlewares/AuthUser');
const {validate_token} = require('./middlewares/AuthJWT');
const { response } = require('express');
const { text } = require('body-parser');

const port = process.env.PORT || 3001;

const db = mysql.createPool({
   host: 'mysqlserver.cvk4ethxrqps.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: 'Reidekonoha753',
    database: 'ask_if',
})


app.use(cors())
app.use(express.json({limit: '30mb'}))
app.use(express.urlencoded({extended:true, limit: '30mb'}))


app.get("/perguntas", validate_token, (req, res)=>{
const query= "SELECT ID_P, TITULO, CONTEUDO, MATRICULA, MATERIA, RESPONDIDA, NOME_USUARIO, NOME_MATERIA FROM perguntas ORDER BY ID_P desc LIMIT 20"
db.query(query, (err,result)=>{
var resultado =  result
res.json({result: resultado})
});
});


app.get("/exist", validate_token, (req, res)=>{
    let arrayMateria=[]
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

    if(testeprofessor.length == 2 && (result[0].email).includes("aluno") === false){
        var nome2 = result[0].nome
        var cargo2 = result[0].cargo
        var pontos2 = result[0].pontos
        var email2 = result[0].email
        var curso2 = result[0].curso
        var foto2 = result[0].foto
 
        const query3 = "SELECT materia FROM usuario_materia WHERE matricula = ?";
        db.query(query3, [matricula], (err,result)=>{
            for(var x = 0; x< result.length; x++){
                arrayMateria.push(result[x].materia)  
                }
                res.json({status: 2, nome:nome2, matricula: matricula, cargo: cargo2, pontos: pontos2, email: email2, curso: curso2, foto: foto2, materia: arrayMateria})
            });
        
        

    }else{
            var nome2 = result[0].nome
            var cargo2 = result[0].cargo
            var pontos2 = result[0].pontos
            var email2 = result[0].email
            var curso2 = result[0].curso
            var foto2 = result[0].foto
            
            const query3 = "SELECT materia FROM usuario_materia WHERE matricula = ?";
            db.query(query3, [matricula], (err,result)=>{
                for(var x = 0; x< result.length; x++){
                    arrayMateria[x] = result[x].materia
                    
                }
                res.json({status: 1, nome:nome2, matricula: matricula, cargo: cargo2, pontos: pontos2, email: email2, curso: curso2, foto: foto2, materia: arrayMateria})
                });
               
            
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







app.post("/get_answers", validate_token,(req, res)=>{
    
    const id = req.body.id
     // ORDER BY (CASE WHEN DeptName = 'Not Assigned' THEN 0 ELSE 1 END), DeptName
    const query= "SELECT resposta,id_pergunta,id_resposta,situacao,Nome_User,matricula_user,fotoUser,subresposta,materia FROM respostas WHERE id_pergunta = ? ORDER BY (CASE WHEN situacao = 1 THEN 0 ELSE 1 END), id_resposta DESC"
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
        const foto = req.body.foto
        const matriculaUserPergunta = req.body.matriculaUserPergunta
        console.log(materiaUser)
        if((cargo===1 || cargo ===2)){
            if(materiaUser.indexOf(materiaPergunta) > -1){
                var query= "INSERT INTO respostas(resposta,id_pergunta,situacao,Nome_User,matricula_user,arquivos,fotoUser,materia) VALUES (?,?,1,?,?,?,?,?)"
            }else{
                var query= "INSERT INTO respostas(resposta,id_pergunta,Nome_User,matricula_user,arquivos,fotoUser,materia) VALUES (?,?,?,?,?,?,?)"
            }
            
        }else{
            if(cargo === 0){
                var query= "INSERT INTO respostas(resposta,id_pergunta,Nome_User,matricula_user,arquivos,fotoUser,materia) VALUES (?,?,?,?,?,?,?)"
            }
        }
        db.query(query, [comentario,id_pergunta,nome,matricula_user,files,foto,materiaPergunta], (err,result)=>{
        const id_resposta = result.insertId
        const query2 = "INSERT INTO notificacoes (matricula,tipoNot,id_pergunta,id_resposta,materia,NomeUserAcao,MatriculaUserAcao) VALUES(?,2,?,?,?,?,?)";
        db.query(query2, [matriculaUserPergunta,id_pergunta,id_resposta,materiaPergunta,nome,matricula_user], (err,result)=>{
    
        });
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
            
            const id_pergunta = result.insertId
            const query2 = "INSERT INTO notificacoes (tipoNot,id_pergunta,materia,NomeUserAcao,MatriculaUserAcao) VALUES(1,?,?,?,?)"

           
            db.query(query2, [id_pergunta,materia,nome,matricula], (err,result)=>{
    
                });

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
    console.log(materia)
    const query= "SELECT matricula FROM usuario_materia WHERE cargo=1 AND materia = ?"
    db.query(query, [materia], (err,result)=>{
   
        res.send({result: result})
      

   
   });
    });

    app.post("/excluir_monitores",(req, res)=>{
        const matricula = req.body.matricula
        const materia = req.body.materia
        const query= "UPDATE usuario SET cargo = 0 WHERE matricula = ? "
        db.query(query, [matricula], (err,result)=>{
            let query2 = "DELETE FROM usuario_materia WHERE matricula = ? AND materia = ?"
            db.query(query2, [matricula,materia], (err,result)=>{
            
                res.send({result: result})
               });
     
       });
        });

        app.post("/set_new_monitor",(req, res)=>{
            const matricula = req.body.matricula
            const materia = req.body.materia
            const cargo = req.body.cargo;
            const query= "UPDATE usuario SET cargo = 1 WHERE matricula = ? "
            db.query(query, [matricula,materia,cargo], (err,result)=>{
                const query2= "INSERT INTO usuario_materia (matricula,materia,cargo) VALUES (?,?,?)"
            db.query(query2, [matricula,materia,cargo], (err,result)=>{
            res.send({result: result})
           });
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

app.post("/attInfos", (req, res)=>{
    const id = req.body.idInfo
    const nome = req.body.nome
const email = req.body.email
const horario = req.body.horario
const link = req.body.link
            
    const query= "UPDATE informacoes_monitores SET nome = ?, email = ?, horario = ?, link = ? WHERE idInfo = ?"
                                  
    db.query(query, [nome,email,horario,link,id], (err,result)=>{
                                       
    res.send(result)
    });
    });

app.post("/InsertInfos",validate_token,(req, res)=>{

const materia = req.body.materia
const nome = req.body.nome
const email = req.body.email
const horario = req.body.horario
const link = req.body.link

const query= "INSERT INTO informacoes_monitores (materia,nome,email,horario,link) VALUES(?,?,?,?,?) "
                                  
db.query(query, [materia,nome,email,horario,link,nome,email,horario,link], (err,result)=>{

res.send(result)
});
});


app.post("/getPosts",validate_token,(req, res)=>{
const materia = req.body.materia
                
const query= "SELECT id_post,Titulo,Conteudo,materia,matricula_monitor,dia,nome_monitor FROM posts_monitores WHERE materia = ? ORDER BY id_post DESC"
                                      
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
const dia = req.body.dia
const nome = req.body.nome
console.log(dia)
                    
const query= "INSERT INTO posts_monitores (Titulo,Conteudo,materia,arquivos,matricula_monitor,dia,nome_monitor) VALUES(?,?,?,?,?,?,?)"
                                          
            db.query(query, [titulo,conteudo,materia,arquivos,matricula,dia,nome], (err,result)=>{
                                  console.log(err)             
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
                    console.log(query)
                    db.query(query, (err,result)=>{
                    res.send({result: result})
                   });
                    });

                    app.post("/inserirnovafoto",validate_token,(req, res)=>{
                        const foto = req.body.foto
                        const matricula = req.body.matricula
                        const query= "UPDATE usuario SET foto = ? WHERE matricula = ?"
                        
                        db.query(query, [foto,matricula], (err,result)=>{
                        res.send(result)
                        });
                        });


                        app.get("/getRanking",(req,res)=>{

                            const query = "SELECT matricula,nome,pontos FROM usuario WHERE cargo = 0 OR cargo = 1  ORDER BY pontos desc LIMIT 5"
                            db.query(query, (err,result)=>{
                                res.json({result: result})
                                });
                            });     


                            app.post("/subresp",validate_token,(req, res)=>{
                                const Nome_User = req.body.Nome_User
                                const ID_RESP = req.body.ID_RESP
                                const FotoUser = req.body.FotoUser
                                const matriculaUser = req.body.matriculaUser
                                const subresp = req.body.subresp
                                const matriculaUserResposta = req.body.matriculaUserResposta
                                const id_p = req.body.id_p
                                const materia = req.body.materia

                                const query= "INSERT INTO subrespostas (ID_RESP,Nome_User,FotoUser,matriculaUser,subresp) VALUES(?,?,?,?,?)"
                                
                                db.query(query, [ID_RESP,Nome_User,FotoUser,matriculaUser,subresp], (err,result)=>{
                                    const id_subresp = result.insertId
                                    const query2= "UPDATE respostas SET subresposta = 1 WHERE id_resposta = ?";
                                    db.query(query2, [ID_RESP], (err,result)=>{
                                    });

                                    const query3 = "INSERT INTO notificacoes (matricula,tipoNot,id_pergunta,id_resposta,id_subresp,materia,NomeUserAcao,MatriculaUserAcao) VALUES(?,3,?,?,?,?,?,?)";
                                    db.query(query3, [matriculaUserResposta,id_p,ID_RESP,id_subresp,materia,Nome_User,matriculaUser], (err,result)=>{
                                    });
                                res.send(result)
                                });
                                });

                                app.post("/getSubresp", validate_token, (req, res)=>{
                                    const id = req.body.id_resp
                                    const query= "SELECT * FROM subrespostas WHERE ID_RESP = ? ORDER BY ID_SUBRESP DESC"
                                    db.query(query,[id],(err,result)=>{
                                    var resultado =  result
                                    res.json({result: resultado})
                                    });
                                    });

                                    app.post("/getnot", validate_token, (req, res)=>{
                                        const cargo = req.body.cargo
                                        const matricula = req.body.matricula
                                        const materia = req.body.materia
                                        var query = ""
                                        console.log(matricula+"\n"+materia+"\n"+cargo)
                                        

                                        if(cargo===0){
                                        query = "SELECT * FROM notificacoes WHERE matricula = ?"
                                        db.query(query,[matricula],(err,result)=>{
                                            var resultado =  result
                                            res.json({result: resultado})
                                            });
                                        }else{
                                            if(materia.length > 1){
                                            query= "SELECT * FROM notificacoes WHERE matricula = ? OR (tipoNot = 1 AND (";
                                            var texto = "";
                                            for(var x=0; x<materia.length; x++){
                                             if(x == materia.length - 1){
                                                 texto += "materia = " + materia[x]
                                             }else{
                                                texto += "materia = " + materia[x] + " OR "
                                             }
                                            }
                                            texto += " ))";
                                            query += texto;
                                            }else{
                                                query = "SELECT * FROM notificacoes WHERE matricula = ? OR (tipoNot = 1 AND materia = "+materia+")"
                                            }
                                            console.log(query)
                                            db.query(query,[matricula],(err,result)=>{
                                                
                                                var resultado =  result
                                                res.json({result: resultado})
                                                });
                                        }
                                        
                                        });

                                        app.post("/get_monitoresbymatricula", (req, res)=>{
                                            const matriculas = req.body.matriculas
                                            let query= "SELECT nome,email,matricula FROM usuario WHERE "
                                            let where = ""
                                            for(var x=0;x<matriculas.length;x++){
                                                
                                                if(x === matriculas.length - 1){
                                                    where+= " matricula = '"+matriculas[x]+"'" 
                                                }else{
                                                    where+= " matricula = '"+matriculas[x] + "' OR"
                                                }
                                                         
                                            }

                                            query += where;
                                            
                                            db.query(query, (err,result)=>{
                                                console.log(result)
                                            res.send(result)
                                            });
                                            });

                                            app.post("/excluirNot", validate_token, (req, res)=>{
                                                const idNot = req.body.idNot
                                                const query= "DELETE FROM notificacoes WHERE idNot = ?";
                                                db.query(query,[idNot],(err,result)=>{
                                                res.json(result)
                                                });
                                                });

                                                app.post("/addDisciplina", validate_token, (req, res)=>{
                                                    const nome = req.body.nome;
                                                    const cargo = req.body.cargo;
                                                    if(cargo === 3){
                                                        const query= "INSERT INTO materia (NOME) values (?)";
                                                        db.query(query,[nome],(err,result)=>{
                                                        res.json(result)
                                                        })
                                                    }else{
                                                        res.send(0)
                                                    }
                                                    ;
                                                    });

                                                    app.post("/excluirDisciplina", validate_token, (req, res)=>{
                                                        const id = req.body.ID_MATERIA;
                                                        const cargo = req.body.cargo;
                                                        if(cargo === 3){
                                                            const query= "DELETE FROM materia WHERE ID_MATERIA = ?";
                                                            db.query(query,[id],(err,result)=>{
                                                                const query2 = "DELETE FROM usuario_materia WHERE materia = ?"
                                                                db.query(query2,[id],(err,result)=>{
                                                                    res.json(result)
                                                                    })
                                                            })
                                                        }else{
                                                            res.send(0)
                                                        }
                                                        ;
                                                        });

                                                        app.post("/VincularProfessorMateria", validate_token, (req, res)=>{
                                                            const id = req.body.ID_MATERIA;
                                                            const cargo = req.body.cargo;
                                                            const usuario = req.body.usuario;
                                                            if(cargo === 3){
                                                                const query= "INSERT INTO usuario_materia (matricula,materia,cargo) VALUES(?,?,2)";
                                                                db.query(query,[usuario,id],(err,result)=>{
                                                                   res.send(result)
                                                                })
                                                            }else{
                                                                res.send(0)
                                                            }
                                                            ;
                                                            });

                                                            app.post("/DesvincularProfessorMateria", validate_token, (req, res)=>{
                                                                const id = req.body.ID_MATERIA;
                                                                const cargo = req.body.cargo;
                                                                const usuario = req.body.usuario;
                                                                if(cargo === 3){
                                                                    const query= "DELETE FROM usuario_materia WHERE matricula = ? AND materia = ?";
                                                                    db.query(query,[usuario,id],(err,result)=>{
                                                                       res.send(result)
                                                                    })
                                                                }else{
                                                                    res.send(0)
                                                                }
                                                                ;
                                                                });

app.listen(port,()=>{
    console.log('porta 3001 aberta');
})


//http://localhost:3001/set_answers
