"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  discardUploads,
  saveProduct,
  uploadImage,
} from "@/app/admin/(shell)/products/actions";
import {
  Field,
  FieldError,
  describedBy,
  focusFirstInvalid,
} from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  FAILURE_TEXT,
  FILE_ERROR,
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  SIZES_BY_TYPE,
  parsePriceCents,
  slugify,
  validateProduct,
  type FieldErrors,
  type ProductInput,
  type SizeType,
} from "@/lib/admin-validation";

type SavedSlot = {
  path: string;
  alt: string;
  creditName: string;
  creditUrl: string;
};

export type ProductFormData = {
  id: number | null;
  slug: string;
  name: string;
  nameJa: string;
  categoryId: string;
  price: string;
  description: string;
  isActive: boolean;
  sizeType: SizeType;
  // Stock text for every size of both types.
  stock: Record<string, string>;
  images: [SavedSlot | null, SavedSlot | null];
};

type Values = Omit<ProductFormData, "id" | "slug" | "images">;

// One image slot. `path` is the saved image. `file` is a picked file that
// uploads on Save. A slot has an image when it has either.
type Slot = {
  path: string | null;
  file: File | null;
  preview: string | null;
  alt: string;
  creditName: string;
  creditUrl: string;
  fileError: string | null;
};

const SLOT_NAMES = ["Front", "Back or detail"] as const;

const hasImage = (slot: Slot) => Boolean(slot.path || slot.file);

function emptySlot(): Slot {
  return {
    path: null,
    file: null,
    preview: null,
    alt: "",
    creditName: "",
    creditUrl: "",
    fileError: null,
  };
}

function slotFrom(saved: SavedSlot | null): Slot {
  if (!saved) return emptySlot();
  return { ...emptySlot(), ...saved };
}

// `uploaded[i]` is the public address of the file uploaded for slot i.
function toInput(
  values: Values,
  slots: Slot[],
  uploaded?: (string | null)[],
): ProductInput {
  const stock: Record<string, string> = {};
  for (const size of SIZES_BY_TYPE[values.sizeType]) {
    stock[size] = values.stock[size] ?? "";
  }
  const image = (slot: Slot, index: number) =>
    hasImage(slot)
      ? {
          path: slot.file ? (uploaded?.[index] ?? "pending") : (slot.path ?? ""),
          alt: slot.alt,
          creditName: slot.creditName,
          creditUrl: slot.creditUrl,
        }
      : null;
  return {
    name: values.name,
    nameJa: values.nameJa,
    categoryId: values.categoryId,
    price: values.price,
    description: values.description,
    isActive: values.isActive,
    sizeType: values.sizeType,
    stock,
    images: [image(slots[0], 0), image(slots[1], 1)],
  };
}

export function ProductForm({
  data,
  categories,
}: {
  data: ProductFormData;
  categories: { id: number; name: string }[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const slotButtons = [
    useRef<HTMLButtonElement>(null),
    useRef<HTMLButtonElement>(null),
  ];
  const slotInputs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const [id] = useState(data.id);
  const [values, setValues] = useState<Values>({
    name: data.name,
    nameJa: data.nameJa,
    categoryId: data.categoryId,
    price: data.price,
    description: data.description,
    isActive: data.isActive,
    sizeType: data.sizeType,
    stock: data.stock,
  });
  const [slots, setSlots] = useState<Slot[]>([
    slotFrom(data.images[0]),
    slotFrom(data.images[1]),
  ]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [focusTick, setFocusTick] = useState(0);
  const [categoryOpen, setCategoryOpen] = useState(false);

  // Focus the first invalid control after the errors are on the page.
  useEffect(() => {
    if (focusTick > 0) focusFirstInvalid(formRef.current);
  }, [focusTick]);

  // Free the local preview addresses when the page closes.
  const slotsRef = useRef(slots);
  useEffect(() => {
    slotsRef.current = slots;
  });
  useEffect(() => {
    return () => {
      for (const slot of slotsRef.current) {
        if (slot.preview) URL.revokeObjectURL(slot.preview);
      }
    };
  }, []);

  const slug = id !== null ? data.slug : slugify(values.name);

  // Check the named keys against the next state. `onlyShown` limits it to keys
  // that already show an error ("after the first error, check on each change").
  function check(
    nextValues: Values,
    nextSlots: Slot[],
    keys: string[],
    onlyShown: boolean,
  ) {
    const found = validateProduct(toInput(nextValues, nextSlots));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of keys) {
        if (onlyShown && !prev[key]) continue;
        if (found[key]) next[key] = found[key];
        else delete next[key];
      }
      return next;
    });
  }

  function setField(patch: Partial<Values>, keys: string[]) {
    const next = { ...values, ...patch };
    setValues(next);
    check(next, slots, keys, true);
  }

  function setSlot(index: number, patch: Partial<Slot>, keys: string[]) {
    const nextSlots = slots.map((slot, i) =>
      i === index ? { ...slot, ...patch } : slot,
    );
    setSlots(nextSlots);
    check(values, nextSlots, keys, true);
  }

  function onSizeType(type: SizeType) {
    setValues({ ...values, sizeType: type });
    setErrors((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([key]) => !key.startsWith("stock:")),
      ),
    );
  }

  function onPick(index: number, file: File | undefined) {
    if (!file) return;
    const bad =
      !(IMAGE_TYPES as readonly string[]).includes(file.type) ||
      file.size === 0 ||
      file.size > MAX_IMAGE_BYTES;
    if (bad) {
      // A bad file is not taken. The slot keeps its state. Focus stays on the
      // slot Button.
      setSlots(
        slots.map((slot, i) =>
          i === index ? { ...slot, fileError: FILE_ERROR } : slot,
        ),
      );
      slotButtons[index].current?.focus();
      return;
    }
    const old = slots[index].preview;
    if (old) URL.revokeObjectURL(old);
    const nextSlots = slots.map((slot, i) =>
      i === index
        ? {
            ...slot,
            file,
            preview: URL.createObjectURL(file),
            fileError: null,
          }
        : slot,
    );
    setSlots(nextSlots);
    // The Front image changed: check "Visible in store" again.
    if (index === 0) check(values, nextSlots, ["active"], true);
  }

  function onRemove(index: number) {
    const old = slots[index].preview;
    if (old) URL.revokeObjectURL(old);
    const nextSlots = slots.map((slot, i) => (i === index ? emptySlot() : slot));
    setSlots(nextSlots);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`alt:${index}`];
      delete next[`creditUrl:${index}`];
      return next;
    });
    // The Remove button goes away: focus moves to the slot Button.
    slotButtons[index].current?.focus();
    if (index === 0) check(values, nextSlots, ["active"], true);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The busy button ignores presses.
    if (busy) return;

    const found = validateProduct(toInput(values, slots));
    const fileError = slots.some((slot) => slot.fileError);
    setErrors(found);
    if (Object.keys(found).length > 0 || fileError) {
      setFocusTick((tick) => tick + 1);
      return;
    }

    setBusy(true);
    // Public addresses of the files uploaded in this attempt.
    const uploaded: (string | null)[] = [null, null];
    const discard = async () => {
      const urls = uploaded.filter((url): url is string => url !== null);
      if (urls.length > 0) {
        try {
          await discardUploads(urls);
        } catch {
          // A leftover file is harmless. The save already failed.
        }
      }
    };
    try {
      for (let index = 0; index < slots.length; index++) {
        const file = slots[index].file;
        if (!file) continue;
        const body = new FormData();
        body.append("file", file);
        // One image per request.
        const result = await uploadImage(body);
        if (!result.ok) {
          await discard();
          if (result.reason === "invalid") {
            // The server read the bytes and did not accept the file.
            setSlots((prev) =>
              prev.map((slot, i) => {
                if (i !== index) return slot;
                if (slot.preview) URL.revokeObjectURL(slot.preview);
                return { ...slot, file: null, preview: null, fileError: FILE_ERROR };
              }),
            );
            setFocusTick((tick) => tick + 1);
            setBusy(false);
            return;
          }
          throw new Error("Upload failed.");
        }
        uploaded[index] = result.url;
      }

      const result = await saveProduct(toInput(values, slots, uploaded), id);
      if (result.ok) {
        toast.success("Product saved");
        if (id === null) {
          // The new product opens its own edit page. The toast shows there.
          router.push(`/admin/products/${result.id}`);
          return;
        }
        // Edit: stay on the page and show the saved values.
        setValues((prev) => ({
          ...prev,
          name: prev.name.trim(),
          nameJa: prev.nameJa.trim(),
          description: prev.description.trim(),
          price: ((parsePriceCents(prev.price) ?? 0) / 100).toFixed(2),
          stock: Object.fromEntries(
            Object.entries(prev.stock).map(([size, text]) => [
              size,
              String(Number(text.trim()) || 0),
            ]),
          ),
        }));
        setSlots((prev) =>
          prev.map((slot, i) => {
            if (slot.preview) URL.revokeObjectURL(slot.preview);
            const path = result.images[i];
            return path
              ? {
                  ...slot,
                  path,
                  file: null,
                  preview: null,
                  fileError: null,
                  alt: slot.alt.trim(),
                  creditName: slot.creditName.trim(),
                  creditUrl: slot.creditUrl.trim(),
                }
              : emptySlot();
          }),
        );
        router.refresh();
      } else if ("errors" in result) {
        await discard();
        setErrors(result.errors);
        setFocusTick((tick) => tick + 1);
      } else {
        throw new Error("Save failed.");
      }
    } catch {
      await discard();
      toast.error(FAILURE_TEXT);
    }
    setBusy(false);
  }

  const sizes = SIZES_BY_TYPE[values.sizeType];

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      className="grid gap-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <Field id="name" label="Name" error={errors.name}>
            <Input
              id="name"
              name="name"
              type="text"
              value={values.name}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={describedBy("name", false, errors.name)}
              onChange={(event) =>
                setField({ name: event.target.value }, ["name"])
              }
              onBlur={() => check(values, slots, ["name"], false)}
            />
          </Field>

          <Field
            id="name-ja"
            label="Japanese name (optional)"
            help="Optional. Shown small under the English name."
          >
            <Input
              id="name-ja"
              name="name_ja"
              type="text"
              lang="ja"
              value={values.nameJa}
              aria-describedby={describedBy("name-ja", true, undefined)}
              onChange={(event) =>
                setValues({ ...values, nameJa: event.target.value })
              }
            />
          </Field>

          <Field
            id="slug"
            label="Slug"
            help="Used in the product address. It cannot change after you save."
          >
            <Input
              id="slug"
              type="text"
              readOnly
              value={slug}
              aria-describedby={describedBy("slug", true, undefined)}
            />
          </Field>

          <Field id="category" label="Category" error={errors.category}>
            <Select
              value={values.categoryId}
              onValueChange={(value) =>
                setField({ categoryId: value }, ["category"])
              }
              onOpenChange={setCategoryOpen}
            >
              <SelectTrigger
                id="category"
                aria-invalid={errors.category ? true : undefined}
                aria-describedby={describedBy("category", false, errors.category)}
                onBlur={() => {
                  if (!categoryOpen) check(values, slots, ["category"], false);
                }}
              >
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            id="price"
            label="Price"
            help="In US dollars."
            error={errors.price}
          >
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground"
              >
                $
              </span>
              <Input
                id="price"
                name="price"
                type="text"
                inputMode="decimal"
                className="pl-7"
                value={values.price}
                aria-invalid={errors.price ? true : undefined}
                aria-describedby={describedBy("price", true, errors.price)}
                onChange={(event) =>
                  setField({ price: event.target.value }, ["price"])
                }
                onBlur={() => check(values, slots, ["price"], false)}
              />
            </div>
          </Field>

          <Field
            id="description"
            label="Description"
            help="Shown on the product page."
            error={errors.description}
          >
            <Textarea
              id="description"
              name="description"
              rows={5}
              value={values.description}
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={describedBy(
                "description",
                true,
                errors.description,
              )}
              onChange={(event) =>
                setField({ description: event.target.value }, ["description"])
              }
              onBlur={() => check(values, slots, ["description"], false)}
            />
          </Field>

          <div className="grid gap-2">
            <div className="flex items-center gap-3">
              <Switch
                id="active"
                checked={values.isActive}
                aria-invalid={errors.active ? true : undefined}
                aria-describedby={describedBy("active", true, errors.active)}
                onCheckedChange={(checked) => {
                  const next = { ...values, isActive: checked };
                  setValues(next);
                  // Turning it on checks at once. Turning it off clears it.
                  if (checked) check(next, slots, ["active"], false);
                  else check(next, slots, ["active"], true);
                }}
                onBlur={() => check(values, slots, ["active"], false)}
              />
              <Label htmlFor="active">Visible in store</Label>
            </div>
            <p id="active-help" className="text-sm text-muted-foreground">
              Hidden products do not show in the store.
            </p>
            {errors.active ? (
              <FieldError id="active-error">{errors.active}</FieldError>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sizes and stock</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-3">
            <span id="sizes-label" className="text-sm leading-none font-medium">
              Sizes
            </span>
            <RadioGroup
              aria-labelledby="sizes-label"
              value={values.sizeType}
              onValueChange={(value) => onSizeType(value as SizeType)}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem id="size-type-clothing" value="clothing" />
                <Label htmlFor="size-type-clothing">
                  Clothing sizes (XS to XL)
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem id="size-type-one" value="one" />
                <Label htmlFor="size-type-one">One size</Label>
              </div>
            </RadioGroup>
          </div>

          <fieldset className="grid gap-4">
            <legend className="mb-4 text-sm leading-none font-medium">
              Stock per size
            </legend>
            {sizes.map((size, index) => {
              const key = `stock:${size}`;
              const inputId = `stock-${size.replace(/\s+/g, "-")}`;
              const isLast = index === sizes.length - 1;
              return (
                <div key={size} className="grid gap-2">
                  <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3">
                    <Label htmlFor={inputId}>{size}</Label>
                    <Input
                      id={inputId}
                      name={`stock_${size}`}
                      type="text"
                      inputMode="numeric"
                      value={values.stock[size] ?? ""}
                      aria-invalid={errors[key] ? true : undefined}
                      aria-describedby={describedBy(
                        inputId,
                        false,
                        errors[key],
                      )}
                      onChange={(event) =>
                        setField(
                          {
                            stock: { ...values.stock, [size]: event.target.value },
                          },
                          [key],
                        )
                      }
                      onBlur={() => check(values, slots, [key], false)}
                    />
                  </div>
                  {errors[key] ? (
                    <div className="pl-[calc(4.5rem+0.75rem)]">
                      <FieldError id={`${inputId}-error`}>{errors[key]}</FieldError>
                    </div>
                  ) : null}
                  {isLast ? (
                    <p className="text-sm text-muted-foreground">
                      0 shows as Sold out in the store.
                    </p>
                  ) : null}
                </div>
              );
            })}
          </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-8">
          {slots.map((slot, index) => (
            <ImageSlot
              key={index}
              index={index}
              slot={slot}
              errors={errors}
              buttonRef={slotButtons[index]}
              inputRef={slotInputs[index]}
              onPick={(file) => onPick(index, file)}
              onRemove={() => onRemove(index)}
              onChange={(patch, keys) => setSlot(index, patch, keys)}
              onBlurCheck={(keys) => check(values, slots, keys, false)}
            />
          ))}
        </CardContent>
      </Card>

      <div>
        <Button
          type="submit"
          className="w-full sm:w-auto"
          aria-disabled={busy ? "true" : undefined}
        >
          {busy ? "Saving..." : "Save product"}
        </Button>
      </div>
    </form>
  );
}

function ImageSlot({
  index,
  slot,
  errors,
  buttonRef,
  inputRef,
  onPick,
  onRemove,
  onChange,
  onBlurCheck,
}: {
  index: number;
  slot: Slot;
  errors: FieldErrors;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onPick: (file: File | undefined) => void;
  onRemove: () => void;
  onChange: (patch: Partial<Slot>, keys: string[]) => void;
  onBlurCheck: (keys: string[]) => void;
}) {
  const filled = hasImage(slot);
  const src = slot.preview ?? slot.path;
  const helpId = `file-help-${index}`;
  const errorId = `file-error-${index}`;
  const altKey = `alt:${index}`;
  const urlKey = `creditUrl:${index}`;
  const picker = (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(event) => {
          onPick(event.target.files?.[0]);
          // The same file can be picked again.
          event.target.value = "";
        }}
      />
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        data-invalid={slot.fileError ? "true" : undefined}
        aria-describedby={slot.fileError ? `${helpId} ${errorId}` : helpId}
        onClick={() => inputRef.current?.click()}
      >
        {filled ? "Replace" : "Add image"}
      </Button>
    </>
  );

  return (
    <fieldset className="grid min-w-0 gap-4">
      <legend className="mb-4 text-sm leading-none font-medium">
        {SLOT_NAMES[index]}
      </legend>
      <div className="grid min-w-0 gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
        <div className="grid content-start justify-items-start gap-3">
          <div className="aspect-[4/5] w-32 overflow-hidden rounded-md border bg-secondary">
            {filled && src ? (
              // A local preview (blob address) or a saved image. next/image
              // adds nothing for a 128px admin preview.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {picker}
          {filled ? (
            <Button type="button" variant="ghost" onClick={onRemove}>
              Remove
            </Button>
          ) : null}
        </div>
        {filled ? (
          <div className="grid min-w-0 content-start gap-4">
            <Field
              id={`alt-${index}`}
              label="Alt text"
              help="Describe the image for people who cannot see it."
              error={errors[altKey]}
            >
              <Input
                id={`alt-${index}`}
                type="text"
                value={slot.alt}
                aria-invalid={errors[altKey] ? true : undefined}
                aria-describedby={describedBy(
                  `alt-${index}`,
                  true,
                  errors[altKey],
                )}
                onChange={(event) =>
                  onChange({ alt: event.target.value }, [altKey])
                }
                onBlur={() => onBlurCheck([altKey])}
              />
            </Field>
            <Field
              id={`credit-name-${index}`}
              label="Credit name (optional)"
              help="Shown on the Image credits page. Leave it empty to keep this image off that page."
            >
              <Input
                id={`credit-name-${index}`}
                type="text"
                value={slot.creditName}
                aria-describedby={describedBy(
                  `credit-name-${index}`,
                  true,
                  undefined,
                )}
                onChange={(event) =>
                  onChange({ creditName: event.target.value }, [])
                }
              />
            </Field>
            <Field
              id={`credit-url-${index}`}
              label="Credit link (optional)"
              help="Optional. Makes the credit name a link."
              error={errors[urlKey]}
            >
              <Input
                id={`credit-url-${index}`}
                type="url"
                autoComplete="off"
                value={slot.creditUrl}
                aria-invalid={errors[urlKey] ? true : undefined}
                aria-describedby={describedBy(
                  `credit-url-${index}`,
                  true,
                  errors[urlKey],
                )}
                onChange={(event) =>
                  onChange({ creditUrl: event.target.value }, [urlKey])
                }
                onBlur={() => onBlurCheck([urlKey])}
              />
            </Field>
          </div>
        ) : null}
      </div>
      <p id={helpId} className="text-sm text-muted-foreground">
        JPG, PNG or WebP. 2 MB or less.
      </p>
      {slot.fileError ? (
        <FieldError id={errorId}>{slot.fileError}</FieldError>
      ) : null}
    </fieldset>
  );
}
