class VarcoRepository {
    async findVarco(id: number) {
        // Simulazione di un recupero da un database
        const varchi = [
            { id: 1, nome: "Varco 1", posizione: "Posizione 1" },
            { id: 2, nome: "Varco 2", posizione: "Posizione 2" },
            { id: 3, nome: "Varco 3", posizione: "Posizione 3" }
        ];
        return varchi.find(varco => varco.id === id);
    }
}

export const varcoRepository = new VarcoRepository();
