-- 1. Create tables
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.households (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    monthly_budget numeric(10,2) DEFAULT 250.00 NOT NULL,
    weekly_budget numeric(10,2) DEFAULT 62.50 NOT NULL,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.household_members (
    household_id uuid REFERENCES public.households(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    PRIMARY KEY (household_id, user_id)
);

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    household_id uuid REFERENCES public.households(id) ON DELETE CASCADE,
    date date NOT NULL,
    amount numeric(10,2) NOT NULL,
    payer text NOT NULL,
    description text,
    category text DEFAULT 'Outros' NOT NULL,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.recurring_expenses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    household_id uuid REFERENCES public.households(id) ON DELETE CASCADE,
    amount numeric(10,2) NOT NULL,
    payer text NOT NULL,
    description text NOT NULL,
    category text DEFAULT 'Outros' NOT NULL,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Profiles: everyone can see profiles to allow invitation lookup
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Households: users can see households they are members of
CREATE POLICY "Users can view their households" ON public.households
    FOR SELECT USING (
        id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert households" ON public.households
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update households" ON public.households
    FOR UPDATE USING (
        id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
    );

-- Household Members: users can see members of their households
CREATE POLICY "Users can view members of their households" ON public.household_members
    FOR SELECT USING (
        household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert members" ON public.household_members
    FOR INSERT WITH CHECK (
        household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid()) OR user_id = auth.uid()
    );

-- Expenses: users can see, insert and delete expenses in their households
CREATE POLICY "Users can view expenses of their households" ON public.expenses
    FOR SELECT USING (
        household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert expenses" ON public.expenses
    FOR INSERT WITH CHECK (
        household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete expenses" ON public.expenses
    FOR DELETE USING (
        household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update expenses" ON public.expenses
    FOR UPDATE USING (
        household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
    );

-- Recurring Expenses: same as expenses
CREATE POLICY "Users can view recurring_expenses of their households" ON public.recurring_expenses
    FOR SELECT USING (
        household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert recurring_expenses" ON public.recurring_expenses
    FOR INSERT WITH CHECK (
        household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete recurring_expenses" ON public.recurring_expenses
    FOR DELETE USING (
        household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update recurring_expenses" ON public.recurring_expenses
    FOR UPDATE USING (
        household_id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid())
    );

-- 4. Triggers
-- Create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add creator to household_members when a new household is created
CREATE OR REPLACE FUNCTION public.handle_new_household()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.household_members (household_id, user_id, email)
  VALUES (new.id, auth.uid(), (SELECT email FROM auth.users WHERE id = auth.uid()));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_household_created
  AFTER INSERT ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_household();
