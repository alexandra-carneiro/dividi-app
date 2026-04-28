-- RESET DE SEGURANÇA (RLS) À PROVA DE FALHAS
-- 1. Removemos todas as políticas antigas
DROP POLICY IF EXISTS "Users can view their households" ON public.households;
DROP POLICY IF EXISTS "Users can insert households" ON public.households;
DROP POLICY IF EXISTS "Users can update households" ON public.households;
DROP POLICY IF EXISTS "Users can view members of their households" ON public.household_members;
DROP POLICY IF EXISTS "Users can insert members" ON public.household_members;
DROP POLICY IF EXISTS "Users can view expenses of their households" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can view their own membership" ON public.household_members;

-- 2. Recriamos usando o padrão seguro EXISTS (evita qualquer recursão ou bloqueio)
-- HOUSEHOLDS
CREATE POLICY "Users can view their households" ON public.households
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.household_members WHERE household_id = id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert households" ON public.households FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update households" ON public.households
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.household_members WHERE household_id = id AND user_id = auth.uid())
);

-- HOUSEHOLD MEMBERS (Apenas lê a si mesmo para evitar recursão infinita)
CREATE POLICY "Users can view their own membership" ON public.household_members
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert members" ON public.household_members
FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.household_members WHERE household_id = household_members.household_id AND user_id = auth.uid())
);

-- EXPENSES
CREATE POLICY "Users can view expenses" ON public.expenses
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.household_members WHERE household_id = expenses.household_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert expenses" ON public.expenses
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.household_members WHERE household_id = expenses.household_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update expenses" ON public.expenses
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.household_members WHERE household_id = expenses.household_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete expenses" ON public.expenses
FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.household_members WHERE household_id = expenses.household_id AND user_id = auth.uid())
);
-- Adiciona a política que permite usuários atualizarem os dados do próprio household
-- (Se a política já existir, essa linha dará um aviso inofensivo)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'households' AND policyname = 'Users can update households'
    ) THEN
        CREATE POLICY "Users can update households" ON public.households
            FOR UPDATE USING (
                id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
            );
    END IF;
END
$$;

-- Adiciona a política que permite usuários atualizarem os gastos da própria casa
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'expenses' AND policyname = 'Users can update expenses'
    ) THEN
        CREATE POLICY "Users can update expenses" ON public.expenses
            FOR UPDATE USING (
                household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
            );
    END IF;
END
$$;
