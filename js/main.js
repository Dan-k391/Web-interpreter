// TODO: improve the marker system

import { Scanner, all_keywords } from './scanner.js';
import { Parser } from './parser.js';
import { Environment } from './environment.js';
import { example_code } from './examples.js';

Vue.use(ELEMENT);
var app = new Vue({
    el: '#app',
    data: {
        dumpast: false,
        editor: null,
        prefix: '$ ',
        file: null,
        file_content: null,
        ast: null,
        terminal: null,
        fit_addon: null,
        markers: [],
        cmd: '',
        do_input: false,
        input_data: '',
        example_id: '',
        example_names: {
            '0': 'Hello World',
            '1': 'Linked list',
            '2': 'Bubble sort'
        }
    },
    mounted() {
        window.onbeforeunload = e => {
            e = e || window.event
            if (e) {
                e.returnValue = '关闭提示'
            }
            return '关闭提示'
        }

        require.config({ paths: { 'vs': 'https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.23.0/min/vs' } });
        window.MonacoEnvironment = {
            getWorkerUrl: function (workerId, label) {
                return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
                    self.MonacoEnvironment = {
                    baseUrl: 'https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.23.0/min'
                    };
                    importScripts('https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.23.0/min/vs/base/worker/workerMain.js');`
                )}`;
            }
        };
        // initialize monaco editor
        require(['vs/editor/editor.main'], () => {
            monaco.languages.register({id: 'pseudocode'});
            monaco.languages.setMonarchTokensProvider('pseudocode', {
                all_keywords,
                tokenizer: {
                    root: [
                        [/[a-zA-Z_]\w*/, {
                            cases: {
                                '@all_keywords': 'keywords',
                                '@default': 'variable',
                            }
                        }],
                        [/\/\/.*$/, 'comment'],
                        [/".*?"/, 'string'],
                        [/'.?'/, 'char'],
                        [/\d+/, 'number'],
                        [/[+\-*/()\[\]=<>:,&.]/, 'operators'],
                    ]
                }
            });
            monaco.editor.defineTheme('pseudocode-theme', {
                base: 'vs',
                rules: [
                    { token: 'keywords', foreground: '#8e2aa0' },
                    { token: 'comment', foreground: '#a1a1a1', fontStyle: 'italic' },
                    { token: 'variable', foreground: '#393a42' },
                    { token: 'string', foreground: '#71a056' },
                    { token: 'char', foreground: '#71a056' },
                    { token: 'number', foreground: '#8b690d' },
                    { token: 'operators', foreground: '#5a76ef' },
                ],
                colors: {
                }
            });
            monaco.languages.registerCompletionItemProvider('pseudocode', {
                provideCompletionItems: (model, position) => {
                    const suggestions = [
                        ...all_keywords.map(keyword => {
                            return {
                                label: keyword,
                                kind: monaco.languages.CompletionItemKind.Keyword,
                                insertText: keyword,
                            };
                        }),
                    ];
                    return { suggestions: suggestions };
                }
            });
            // create the editor
            this.editor = monaco.editor.create(this.$refs.editor, {
                language: 'pseudocode',
                fontSize: '18px',
                theme: 'pseudocode-theme',
                automaticLayout: true
            });
            this.editor.addAction({
                id: 'run',
                label: 'run',
                keybindings: [
                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
                ],
                run: () => {
                    this.run();
                }
            })
        });

        this.terminal = new Terminal({
            rendererType: 'dom',
            theme: {
                foreground: 'white',
                background: '#696969'
            }
        });
        this.fit_addon = new FitAddon.FitAddon();
        this.terminal.loadAddon(this.fit_addon);
        this.terminal.open(this.$refs.terminal);
        // fit_addon worked!!!!
        this.fit_addon.fit();
        this.terminal.focus();
        this.terminal.writeln('Welcome to the Pseudocode interpreter');
        this.terminal.write(this.prefix);

        this.terminal.onKey(e => {
            let code = e.domEvent.which;
            if (code === 13){
                this.terminal.writeln(e.key);
                this.execute_cmd();
                this.cmd = '';
            }
            else if (code === 8) {
                this.terminal.write('\b \b');
                this.cmd = this.cmd.substring(0, this.cmd.length - 1);
            }
            else {
                this.cmd = this.cmd + e.key;
                this.terminal.write(e.key);
            }
        });
    },
    methods: {
        run() {
            // clear the markers
            this.markers = [];
            monaco.editor.setModelMarkers(this.editor.getModel(), 'pseudocode', this.markers);
            this.code = this.editor?.getValue();
            if (this.code) {
                let tokens = null;
                let scanner = new Scanner(this.code);
                try {
                    tokens = scanner.scan();
                }
                catch (e) {
                    this.set_mark(e);
                    this.report(e.toString());
                    return;
                }
                console.log(tokens);
                // for (let ts of t) {
                //     this.terminal.writeln(ts['type'].toString() + ' ' + tss['value'].toString());
                // }
                // this.terminal.writeln('Tokenization completed');
                let ast = null;
                let parser = new Parser(tokens);
                try {
                    ast = parser.parse();
                }
                catch (e) {
                    this.set_mark(e);
                    this.report(e.toString());
                    return;
                }
                if (ast != null) {
                    // this.terminal.writeln('Parsing completed');
                    this.dumpast ? ast.dump('') : null;
                    this.do_input = true;
                    let start = new Date().getTime();
                    try {
                        // Define the global environment
                        let global_env = new Environment();
                        // The object global_env is passed by reference
                        ast.evaluate(global_env);
                    } catch (e) {
                        this.set_mark(e);
                        this.report(e.toString());
                        return;
                    }
                    let end = new Date().getTime();
                    this.do_input = false;
                    let time = end - start;
                    this.terminal.writeln('Execution completed in ' + time + 'ms');
                }
                // cannot write in execute_cmd() for unknown reason
                this.terminal.write(this.prefix);
            }
        },
        execute_cmd() {
            if (this.do_input) {
                this.input_data = this.cmd;
            }
            else {
                if (this.cmd == 'help') {
                    this.terminal.writeln('help: show help');
                    this.terminal.writeln('run: run the code');
                    this.terminal.writeln('clear/cls: clear the terminal');
                    this.terminal.writeln('load: load the following examples');
                    for (let key in this.example_names) {
                        this.terminal.writeln('  ' + key + ': ' + this.example_names[key]);
                    }
                    this.terminal.write(this.prefix);
                }
                else if (this.cmd == 'run') {
                    this.run();
                }
                else if (this.cmd == 'clear' || this.cmd == 'cls') {
                    this.terminal.clear();
                    this.terminal.write(this.prefix);
                }
                else if (this.cmd == 'egg') {
                    this.terminal.writeln('An egg? Maybe...');
                    this.terminal.write(this.prefix);
                    console.log('......');
                }
                else if (this.cmd.substring(0, 4) == 'load') {
                    // number is a string
                    let number = this.cmd.substring(5);
                    if (number in example_code) {
                        this.editor.setValue(example_code[number]);
                    }
                    this.terminal.write(this.prefix);
                }
                else {
                    this.terminal.writeln(this.cmd + ': Command not found');
                    this.terminal.write(this.prefix);
                }
            }
        },
        resize_terminal() {
            this.fit_addon.fit();
        },
        set_mark(e) {
            // for debug
            console.log(e);
            this.markers.push({
                startLineNumber: e.line,
                endLineNumber: e.line,
                startColumn: e.start_column + 1,
                endColumn: e.end_column + 1,
                message: e.msg,
                severity: monaco.MarkerSeverity.Error
            });
            monaco.editor.setModelMarkers(this.editor.getModel(), 'pseudocode', this.markers);
        },
        report(err_msg) {
            this.terminal.write('\x1b[31;1mError: \x1B[0m')
            this.terminal.writeln(err_msg);
            this.terminal.write(this.prefix);
        },
        handle_change(file) {
            this.file_content = file.raw;
            let file_name = file.name;
            let file_type = file_name.substring(file_name.lastIndexOf('.') + 1);
            if (this.file_content) {
                if (file_type === 'pc') {
                    this.import_file();
                } 
                else {
                    this.$message({
                        type: 'warning',
                        message: 'Incorrect file type'
                    });
                }
            }
            else {
                this.$message({
                    type: 'warning',
                    message: 'Please select a file'
                });
            }
        },
        import_file() {
            let _this = this;
            let reader = new FileReader();
            reader.readAsText(_this.file_content);
            reader.onload = function() {
                _this.editor.setValue(reader.result);
            }
        },
        save_file() {
            try {
                let content = this.editor.getValue();
                let blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
                saveAs(blob, 'pseudocode.pc');
            }
            catch (e) {
                this.$message({
                    type: 'warning',
                    message: 'Failed to save file'
                });
            }
        }
    }
});

export {
    app
}
