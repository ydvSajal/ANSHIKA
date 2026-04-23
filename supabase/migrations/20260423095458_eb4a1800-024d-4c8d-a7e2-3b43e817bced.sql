-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'faculty', 'student');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Security definer role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'));

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Domain tables
CREATE TABLE public.food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE public.order_status AS ENUM ('pending', 'preparing', 'ready', 'delivered');

CREATE TABLE public.food_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES public.food_items ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  status order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  source TEXT NOT NULL,
  destination TEXT NOT NULL,
  ride_time TIMESTAMPTZ NOT NULL,
  seats INT NOT NULL DEFAULT 1,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE public.medical_status AS ENUM ('pending', 'reviewed', 'resolved');

CREATE TABLE public.medical_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  issue TEXT NOT NULL,
  status medical_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: own + admin
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles: read own + admin manage
CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Food items: anyone signed in views; admin manages
CREATE POLICY "food_items_select" ON public.food_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "food_items_admin" ON public.food_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Food orders: own + admin
CREATE POLICY "orders_select_own" ON public.food_orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "orders_insert_own" ON public.food_orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "orders_admin_update" ON public.food_orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Rides: all signed in view; owner inserts/deletes
CREATE POLICY "rides_select" ON public.rides FOR SELECT TO authenticated USING (true);
CREATE POLICY "rides_insert_own" ON public.rides FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "rides_delete_own" ON public.rides FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Medical: own + admin
CREATE POLICY "medical_select_own" ON public.medical_requests FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "medical_insert_own" ON public.medical_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "medical_admin_update" ON public.medical_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Subjects: all view; faculty/admin create
CREATE POLICY "subjects_select" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "subjects_faculty_insert" ON public.subjects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'faculty') OR public.has_role(auth.uid(), 'admin'));

-- Notes: all view; faculty/admin upload
CREATE POLICY "notes_select" ON public.notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "notes_faculty_insert" ON public.notes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'faculty') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "notes_faculty_delete" ON public.notes FOR DELETE TO authenticated USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Notifications: own
CREATE POLICY "notif_select_own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_insert_any" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Notify student when order ready
CREATE OR REPLACE FUNCTION public.notify_order_ready()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'ready' AND OLD.status IS DISTINCT FROM 'ready' THEN
    INSERT INTO public.notifications (user_id, message)
    VALUES (NEW.user_id, 'Your food order is ready for pickup!');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_order_ready
AFTER UPDATE ON public.food_orders
FOR EACH ROW EXECUTE FUNCTION public.notify_order_ready();

-- Notify all students when new notes uploaded
CREATE OR REPLACE FUNCTION public.notify_new_notes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  subj_name TEXT;
BEGIN
  SELECT name INTO subj_name FROM public.subjects WHERE id = NEW.subject_id;
  INSERT INTO public.notifications (user_id, message)
  SELECT ur.user_id, 'New notes uploaded for ' || COALESCE(subj_name, 'a subject') || ': ' || NEW.title
  FROM public.user_roles ur WHERE ur.role = 'student';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_notes
AFTER INSERT ON public.notes
FOR EACH ROW EXECUTE FUNCTION public.notify_new_notes();

-- Storage bucket for notes
INSERT INTO storage.buckets (id, name, public) VALUES ('notes', 'notes', true);

CREATE POLICY "notes_bucket_read" ON storage.objects FOR SELECT TO authenticated, anon USING (bucket_id = 'notes');
CREATE POLICY "notes_bucket_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'notes' AND (public.has_role(auth.uid(), 'faculty') OR public.has_role(auth.uid(), 'admin')));
CREATE POLICY "notes_bucket_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'notes' AND (owner = auth.uid() OR public.has_role(auth.uid(), 'admin')));

-- Seed food
INSERT INTO public.food_items (name, description, price) VALUES
  ('Veg Sandwich', 'Grilled with cheese & veggies', 60),
  ('Masala Chai', 'Hot spiced tea', 20),
  ('Paneer Roll', 'Spicy paneer wrap', 90),
  ('Cold Coffee', 'Iced coffee with milk', 50),
  ('Samosa', 'Crispy potato samosa (2 pcs)', 30);
