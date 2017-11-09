# Development

A CLI funcina tanto para temas customizados quanto para o tema padrão da Edools, ou seja, é usada tanto por clientes 
quando pelos devs internos.

### Principais Libs Utilizadas

* [commander](https://www.npmjs.com/package/commander) -> Para gerenciar os comandos do terminal.
* [inquirer](https://www.npmjs.com/package/inquirer) -> Para criar prompts no terminal.
* [gulpjs](https://gulpjs.com/) e plugins gulp -> Para gerenciar as tarefas, compilar, minify, uglify...
* [browser-sync](https://www.browsersync.io/) -> Para criar o servidor proxy e servir os arquivos estáticos.

### O que eu preciso saber antes de codar neste projeto?

Entender o básico de gulpjs é o principal, você pode aprender 
[neste tutorial](https://tableless.com.br/gulp-o-novo-automatizador/).

### Explicando cada comando:

#### edt init

O comando `edt init` é o comando utilizado para iniciar um nomo projeto de tema, ele simplesmente copia alguns arquivos
para a pasta onde o dev executa este comando, e cria o `theme.json` baseando-se nos parâmetros do comando.

_Quais arquivos este comando copia?_

Os aquivos da pasta [templates](bin/templates).

_Como?_

Este comando cria o arquivo `theme.json` na função `init` do arquivo [index.js](bin/index.js) e também chama a task 
gulp `copy:init-templates` que está no arquivo [copy.js](bin/tasks/copy.js) para copiar os arquivos básicos do tema.


#### edt s

O comando `edt s` é o comando utilizado para o desenvolvimento do tema, ele cria uma especie de espelho do tema que 
está sendo editado e cria uma URL pra você poder acessar no browser. Esta URL nada mais é do que um proxy da URL do 
servidor, ou seja, o tema continua sendo servido pelo servidor, seja ele local ou um de nossos servidores de 
staging ou production.
 
_Então pra que este proxy?_ 

Esta URL proxy é gerada pelo browser-sync, quando acessamos esta URL, arquivos estáticos como JS, CSS e Images são
servidos da pasta local `dist` do tema, ao invés de serem servidor pelo servidor original. Isso nos possibilita 
acompanhar em tempo real as alterações destes arquivos e ver estas alterações no browser. O browser-sync em conjunto 
com o gulp, trata automaticamente de recarregar a página quando algum arquivo do tema é modificado, para o dev não
precisar ficar dando F5 toda vida :)

_OK, mas e os arquivos liquid? Eles não são estáticos._

Sim, mas a CLI também mostra as alterações no browser, igual faz com JS, CSS e imagens, isto porque toda alteração 
no tema é automaticamente sincronizada com o servidor, ou seja, toda vez que o dev alterar um arquivo, a CLI tratará 
este arquivo, e fará um request para a API da Edools para poder salvar este arquivos no banco de dados, depois disto, 
recarrega a página para que o dev possa ver o resultado.

_Huuum, e quais arquivos de código da CLI são responsáveis por isso tudo?_

Vamos lá, o comando `edt s`chama a função `serve` no arquivo [index.js](bin/index.js), que por sua vez, chama a 
task `serve` do gulp, que está no arquivo [serve.js](bin/tasks/serve.js), é esta task quem starta o browser-sync e 
os watchers do gulp. Os watchers observam cada tipo de arquivo e chama suas respectivas tasks de compilação, quando 
estes arquivos são modificados, e depois disto, a página é recarregada.

_E quem envia o arquivo pro servidor?_

Isto é feito no arquivo [service.js](bin/service.js) na função `upload_single` que é chamada no arquivo 
[serve.js](bin/tasks/serve.js). 

_Onde estão as configurações do browser-sync?_

No arquivo [config.js](bin/config.js), todas as configurações da CLI vem deste arquivo.

### edt b

O comando `edt b` é o comando utilizado para compilar todos os arquivos estáticos, cada tipo de arquivo tem suas tasks
para tratá-los, o resultado da compilação é colocado na pasta `dist` do tema, esta pasta contém a versão final 
otimizada dos arquivos do tema, esta taks também é executada pelo commando `edt s`:

JS: [scripts.js](bin/tasks/scripts.js) - Compila todos os arquivos JS de ES6 pra ES5 com Babel, faz uglify e também 
junta as dependências instaladas via bower em um só arquivo chamado `theme.base.vendors.min.js`, os arquivos js do 
tema são todos mesclados em um arquivo chamado `theme.base.min.js`.

SCSS: [styles.js](bin/tasks/styles.js) - Compila todos os arquivos SCSS para CSS e mescla tudo no arquivo 
`theme.base.min.css`, também roda o [CSSComb](http://csscomb.com/) que é um formatador de CSS, o CSSComb modifica os 
arquivos fonte de SCSS do tema.

Liquid e Imagens: [copy.js](bin/tasks/copy.js) - Liquid, Imagens e CSS não precisam ser compilados, então são apenas 
copiados para a pasta `dist` do tema.


### edt d

O comando `edt d` é o comando utilizado para fazer download de arquivos que estão no banco de dados do servidor, este 
comando pode tanto fazer download de um arquivos quanto de todos os arquivos. Este comando chama a função `download` do 
arquivo [index.js](bin/index.js) que por sua vez chama a função `download_all` ou `download_single` do arquivo 
[service.js](bin/service.js).

### edt u

O comando `edt u` é o comando utilizado para fazer upload de arquivos da pasta do tema para o banco de dados do 
servidor, este comando pode tanto fazer download de um arquivos quanto de todos os arquivos. Este comando chama a 
função `download` do arquivo [index.js](bin/index.js) que por sua vez chama a função `upload_all` ou `upload_single` do 
arquivo [service.js](bin/service.js).

### edt deploy

O comando `edt deploy` é o comando utilizado para fazer deploy do tema principal da Edools, este comando é exclusivo
para uso por devs internos da Edools, Ele chama a função `deploy` do arquivo [index.js](bin/index.js) que por sua vez 
chama a task `deploy` do arquivo [deploy.js](bin/tasks/deploy.js).
