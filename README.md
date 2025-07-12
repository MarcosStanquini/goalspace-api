RF01 O sistema deve permitir o cadastro de usuários com nome, e-mail e senha 
RF02 O sistema deve permitir o login com e-mail e senha, retornando um token JWT 
RF03 O sistema deve proteger todas as rotas (exceto login e cadastro) com autenticação 
JWT 
RF04 O sistema deve permitir que o usuário crie metas (goals) com título, deadline e 
descrição opcional 
RF05 O sistema deve listar as metas do usuário, com paginação via query params 
RF06 O sistema deve permitir filtrar metas por status (active, completed, expired) 
RF07 O sistema deve permitir o detalhamento de uma meta, incluindo suas subtarefas 
RF08 O sistema deve permitir editar título, descrição ou deadline de uma meta 
RF09 O sistema deve permitir excluir uma meta, incluindo suas subtarefas associadas 
RF10 O sistema deve permitir o cadastro de subtarefas para uma meta 
RF11 O sistema deve permitir marcar/desmarcar uma subtarefa como concluída 
RF12 O sistema deve permitir excluir uma subtarefa 
RF13 O sistema deve calcular dinamicamente o status de uma meta com base na deadline e 
conclusão 
RF14 O sistema deve expor um dashboard resumido do progresso do usuário 
RF15 O sistema deve permitir o logout (opcional) limpando o cookie/token 